import { Injectable } from '@nestjs/common';
import { Subject } from 'src/entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import mongoose from 'mongoose';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private repo: MongoRepository<Subject>,
  ) { }

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
                    { $in: ["$$subId", "$subject.subjectId"] }
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
        $project: {
          "subject_id": "$_id",
          "subjectCode": "$subjectCode",
          "subjectName": "$subjectName"
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
        result: result
      }
    }

  }
}
