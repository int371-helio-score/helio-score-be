import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose from 'mongoose';
import { Academic } from 'src/entities/academic.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class AcademicService {
  constructor(
    @InjectRepository(Academic)
    private repo: MongoRepository<Academic>,
  ) { }

  async getAcademic(req: any) {
    let result: any = []
    const owner = await this.getAcademicByOwner(req.userId)
    const member = await this.getAllAcademicByEmail(req.email)

    for (const each of owner) {
      result.push(each)
    }
    for (const each of member) {
      const index = result.findIndex((e: any) => e._id.toString() === each._id.toString())
      if (index === -1) {
        result.push(each)
      }
    }


    if (result.length == 0) {
      return {
        statusCode: 404,
        message: "No Records."
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

  async getAcademicByOwner(userId: any) {
    return await this.repo.aggregate([
      {
        $lookup: {
          from: "subject",
          let: { subId: "$subjects" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$subId"] },
                    { $eq: ["$owner", new mongoose.Types.ObjectId(userId)] }
                  ]
                }
              }
            }
          ],
          as: "subject"
        }
      },
      { $unwind: "$subject" },
      {
        $group: {
          "_id": "$_id",
          "academicYear": { $first: "$academicYear" },
          "semester": { $first: "$subject.semester" }
        }
      },
      {
        $sort: {
          "academicYear": -1, "semester": -1
        }
      }
    ]).toArray()
  }

  async getAllAcademicByEmail(email: string) {
    return await this.repo.aggregate([
      {
        $lookup: {
          from: "subject",
          let: { subId: "$subjects" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$subId"] },

              }
            }
          ],
          as: "subject"
        }
      },
      { $unwind: "$subject" },
      {
        $lookup: {
          from: "class",
          let: { subId: "$subject._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$subject", "$$subId"]
                }
              }
            }
          ],
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
                  $in: ["$_id", "$$std"]
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
          "academicYear": { $first: "$academicYear" },
          "semester": { $first: "$subject.semester" }
        }
      },
      {
        $sort: {
          "academicYear": -1, "semester": -1
        }
      }
    ]).toArray()
  }

  async createOrUpdateAcademic(subId: string, year: string) {
    try {
      const isExist = await this.repo.findBy({ where: { academicYear: year } })

      if (isExist.length > 0) {
        const subjectList = isExist[0].subjects
        subjectList.push(subId)
        await this.repo.update({ _id: isExist[0]._id }, { subjects: subjectList })
      } else {
        const obj = {
          academicYear: year,
          subjects: [subId]
        }
        await this.repo.save(obj)
      }
    } catch (err: any) {
      throw {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }

  }

  async deleteSubjectFromAcademic(subId: string) {
    const isExist = await this.repo.findBy({ where: { subjects: { $in: [new mongoose.Types.ObjectId(subId)] } } })
    if (isExist.length > 0) {
      if (isExist[0].subjects.length == 1) {
        await this.repo.delete({ _id: isExist[0]._id })
      } else {
        await this.repo.updateOne({ _id: isExist[0]._id }, { $pull: { subjects: new mongoose.Types.ObjectId(subId) } })
      }

    } else {
      throw new NotFoundException()
    }
  }
}
