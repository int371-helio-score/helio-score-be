import { Injectable, Inject } from '@nestjs/common';
import { Subject } from 'src/entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import mongoose from 'mongoose';
import { AcademicService } from '../academic/academic.service';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private repo: MongoRepository<Subject>,
  ) { }

  @Inject()
  academicService: AcademicService

  async getSubjectsByAcademicSemester(userId: string, params: any) {
    const academicYear = params.academicYear
    const semester = params.semester
    const ownerId = userId

    const result = await this.repo.aggregate([
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
          "subject_id": "$_id",
          "subjectCode": "$subjectCode",
          "subjectName": "$subjectName",
          "grade": "$grade",
          "totalClass": { $size: "$class" }
        }
      }
    ]).toArray()

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

  async createSubject(userId: string, body: any) {
    const subject = {
      subjectCode: body.subjectCode,
      subjectName: body.subjectName,
      owner: new mongoose.Types.ObjectId(userId),
      semester: body.semester,
      grade: body.semester
    }

    await this.repo.save(subject)
    const result = await this.repo.find({ order: { _id: -1 } })
    await this.academicService.createOrUpdateAcademic(result[0]._id, body.academicYear)

    return {
      statusCode: 200,
      message: "success"
    }

  }
}
