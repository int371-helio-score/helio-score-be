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

  async getScore(subjectId: string, ownerId: string, scoreTitle: string) {
    const result = await this.repo.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(subjectId), owner: new mongoose.Types.ObjectId(ownerId) } },
      {
        $lookup: {
          from: "class",
          localField: "_id",
          foreignField: "subjectId",
          as: "class"
        }
      },
      { $unwind: "$class" },
      {
        $lookup: {
          from: "group",
          localField: "class.member.groupId",
          foreignField: "_id",
          as: "group"
        }
      },
      { $unwind: "$group" },
      {
        $lookup: {
          from: "listmember",
          localField: "group._id",
          foreignField: "groupId",
          as: "member"
        }
      },
      {
        $lookup: {
          from: "score",
          let: { classId: "$class._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$class", "$$classId"] },
                    { $eq: ["$title", scoreTitle] }
                  ]
                }
              }
            }
          ],
          as: "scores"
        }
      },
      { $unwind: "$scores" },
      {
        $project: {
          "_id": "$_id",
          "subjectCode": "$subjectCode",
          "subjectName": "$subjectName",
          "semester": "$semester",
          "class": "$class",
          "group": "$group",
          "title": "$scores.title",
          "total": "$scores.total",
          "stdScore": {
            $map: {
              "input": {
                $zip: { "inputs": ["$scores.scores", "$member"] }
              },
              "as": "el",
              "in": {
                "scores": { $arrayElemAt: ["$$el", 0] },
                "member": { $arrayElemAt: ["$$el", 1] }
              }
            }
          }
        }
      },
      { $unwind: "$stdScore" }
    ]).toArray()

    return result
  }

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
          "_id": "$_id",
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
