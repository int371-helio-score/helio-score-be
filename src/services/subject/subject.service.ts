import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Subject } from 'src/entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import mongoose from 'mongoose';
import { AcademicService } from '../academic/academic.service';
import { ClassService } from '../class/class.service';
import { CreateSubjectDto, EditSubjectDto } from 'src/dto/subject/create-subject.dto';
import { AccountService } from '../account/account.service';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private repo: MongoRepository<Subject>,
  ) { }

  @Inject()
  academicService: AcademicService
  @Inject(forwardRef(() => ClassService))
  classService: ClassService
  @Inject(forwardRef(() => AccountService))
  accountService: AccountService

  async getSubjectsByAcademicSemester(user: any, params: any) {
    let result: any = []
    const owned = await this.getOwnedSubjects(user.userId, params)
    const added = await this.getSubjectsAddedByOther(user.email, params)

    for (const each of owned) {
      each.owner = JSON.parse(each.owner)
      result.push(each)
    }
    for (const each of added) {
      each.owner = JSON.parse(each.owner)
      result.push(each)
    }
    if (result.length == 0) {
      return {
        statusCode: 404,
        message: "No records."
      }
    }

    return {
      statusCode: 200,
      message: "success",
      data: {
        total: result.length,
        results: result
      }
    }

  }

  async getSubjectsAddedByOther(email: string, params: any) {
    const academicYear = Number(params.academicYear)
    const semester = params.semester
    return await this.repo.aggregate([
      {
        $lookup: {
          from: "academic",
          let: { subId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$academicYear", academicYear] },
                    { $in: ["$$subId", "$subjects"] }
                  ]
                }
              }
            }
          ],
          as: "academic"
        }
      },
      { $unwind: "$academic" },
      { $match: { semester: semester } },
      {
        $lookup: {
          from: "class",
          localField: "_id",
          foreignField: "subject",
          as: "class"
        }
      },
      { $unwind: "$class" },
      {
        $lookup: {
          from: "studentList",
          let: { std: "$class.studentList" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$std"]
                }, "members.email": email
              }
            }
          ],
          as: "studentList"
        }
      },
      { $unwind: "$studentList" },
      {
        $group: {
          "_id": "$_id",
          "subjectCode": { $first: "$subjectCode" },
          "subjectName": { $first: "$subjectName" },
          "grade": { $first: "$grade" },
          "class": { $first: "$class.room" }
        }
      },
      {
        $project: {
          "_id": 1,
          "subjectCode": 1,
          "subjectName": 1,
          "grade": 1,
          "class": 1,
          "owner": 'false'
        }
      }
    ]).toArray()
  }

  async getOwnedSubjects(userId: string, params: any) {
    const academicYear = Number(params.academicYear)
    const semester = params.semester
    const ownerId = userId
    return await this.repo.aggregate([
      {
        $lookup: {
          from: "academic",
          let: { subId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$academicYear", academicYear] },
                    { $in: ["$$subId", "$subjects"] }
                  ]
                }
              }
            }
          ],
          as: "academic"
        }
      },
      { $unwind: "$academic" },
      { $match: { owner: new mongoose.Types.ObjectId(ownerId), semester: semester } },
      {
        $lookup: {
          from: "class",
          localField: "_id",
          foreignField: "subject",
          as: "class"
        }
      },
      {
        $project: {
          "_id": "$_id",
          "subjectCode": "$subjectCode",
          "subjectName": "$subjectName",
          "grade": "$grade",
          "totalClass": { $size: "$class" },
          "owner": 'true'
        }
      }
    ]).toArray()
  }

  async createSubject(userId: string, body: CreateSubjectDto) {
    if (body.class.length == 0) {
      return {
        statusCode: 400,
        message: "Class is required."
      }
    }
    const subject = {
      subjectCode: body.subjectCode,
      subjectName: body.subjectName,
      owner: new mongoose.Types.ObjectId(userId),
      semester: body.semester,
      grade: body.grade
    }

    await this.repo.save(subject)
    const result = await this.repo.find({ order: { _id: -1 } })
    const subjectId = result[0]._id
    await this.academicService.createOrUpdateAcademic(subjectId, body.academicYear)
    await this.classService.createClass(subjectId, body.class)

    return {
      statusCode: 200,
      message: "success"
    }

  }

  async find(subject_id: string) {
    try {
      return await this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(subject_id) } })
    } catch (err: any) {
      throw {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  async editSubject(userId: string, body: EditSubjectDto) {
    const subj = (await this.find(body.subjectId))[0]

    if (subj === undefined) {
      return {
        statusCode: 404,
        message: "Subject Not Found."
      }
    }

    if (subj.owner.toString() !== userId) {
      return {
        statusCode: 403,
        message: "You do not have permission."
      }

    }

    subj.subjectCode = body.subjectCode
    subj.subjectName = body.subjectName
    subj.semester = body.semester
    subj.grade = body.grade

    await this.repo.save(subj)
    await this.academicService.deleteSubjectFromAcademic(subj._id)
    await this.academicService.createOrUpdateAcademic(subj._id, body.academicYear)

    return {
      statusCode: 200,
      message: "success"
    }
  }

  async deleteSubject(subjectId: string, userId?: string) {
    const subj = (await this.find(subjectId))[0]

    if (subj === undefined) {
      return {
        statusCode: 404,
        message: "Subject Not Found."
      }
    }

    if (userId) {
      if (subj.owner.toString() !== userId) {
        return {
          statusCode: 403,
          message: "You do not have permission."
        }

      }
    }

    const classList = await this.classService.findBySubjectId(subj._id.toString())
    if (classList) {
      for (const each of classList) {
        await this.classService.deleteClass(each._id.toString())
      }
    }

    await this.academicService.deleteSubjectFromAcademic(subjectId)
    await this.repo.delete({ _id: subj._id })

    return {
      statusCode: 200,
      message: "success"
    }
  }

  async findByUserId(userId: string) {
    try {
      return await this.repo.findBy({ where: { owner: new mongoose.Types.ObjectId(userId) } })
    } catch (err: any) {
      throw {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  async getOwnershipBySubjectId(userId: string, subjectId: string) {
    const subj = (await this.find(subjectId))[0]
    if (!subj) {
      return {
        statusCode: 404,
        message: "Subject Not Found."
      }
    }

    return {
      statusCode: 200,
      message: "success",
      data: {
        results: {
          owner: subj.owner.toString() == userId
        }
      }
    }
  }

  async getSubjectInfoBySubjectId(subjectId: string) {
    const subj = (await this.find(subjectId))[0]
    if (!subj) {
      return {
        statusCode: 404,
        message: "Subject Not Found."
      }
    }
    const owner = (await this.accountService.findById(subj.owner.toString()))[0]
    if (!owner) {
      return {
        statusCode: 404,
        message: "Owner Not Found."
      }
    }

    return {
      statusCode: 200,
      message: "success",
      data: {
        results: {
          ownerName: `${owner.firstName} ${owner.lastName}`,
          ownerEmail: owner.email
        }
      }
    }
  }
}
