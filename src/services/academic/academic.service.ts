import { Injectable } from '@nestjs/common';
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

  async getAcademicByOwner(req: any) {
    const res: any[] = []
    const ownerId = req.userId
    const result = await this.repo.aggregate([
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
                    { $eq: ["$owner", new mongoose.Types.ObjectId(ownerId)] }
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
        $project: {
          "_id": "$subject._id",
          "academicYear": "$academicYear",
          "semester": "$subject.semester"
        }
      },
      {
        $sort: {
          "academicYear": -1, "semester": -1
        }
      }
    ]).toArray()

    if (result.length == 0) {
      return {
        statusCode: 404,
        message: "No Records."
      }
    }

    const academics = result.filter((value, index, arr) => index === arr.findIndex((t) =>
      (t.semester === value.semester && t.academicYear === value.academicYear)
    ))

    for (const each of academics) {
      const obj = {
        id: each._id,
        semester: each.semester,
        academicYear: each.academicYear
      }

      res.push(obj)
    }

    return {
      statusCode: 200,
      message: "success",
      data: {
        total: res.length,
        results: res
      }
    }

  }

  async createOrUpdateAcademic(subId: string, year: string) {
    const isExist = await this.repo.findBy({ where: { academicYear: year } })

    if (isExist.length > 0) {
      const subjectList = isExist[0].subjects
      subjectList.push(subId)
      this.repo.update({ _id: isExist[0]._id }, { subjects: subjectList })
    } else {
      const obj = {
        academicYear: year,
        subjects: [subId]
      }
      this.repo.save(obj)
    }

  }
}
