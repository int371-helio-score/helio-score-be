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
          from: "academic",
          pipeline: [
            {
              $match: {
                "subject": { $elemMatch: { "subjectId": new mongoose.Types.ObjectId(subjectId) } }
              }
            }
          ],
          as: "academic"
        }
      },
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
      { $unwind: "$member" },
      {
        $lookup: {
          from: "score",
          let: { stdId: "$member.studentId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$studentId", "$$stdId"] },
                    { $eq: ["$title", scoreTitle] }
                  ]
                }
              }
            }
          ],
          as: "score"
        }
      }
    ]).toArray()

    return result
  }

}
