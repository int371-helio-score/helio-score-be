import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose from 'mongoose';
import { Class } from 'src/entities/class.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private repo: MongoRepository<Class>
  ) { }

  async getAllClassBySubject(subject_id: string) {
    const result = await this.repo.aggregate([
      { $match: { subject: new mongoose.Types.ObjectId(subject_id) } },
      {
        $lookup: {
          from: "studentList",
          localField: "studentList",
          foreignField: "_id",
          as: "member"
        }
      },
      { $unwind: "$member" },
      {
        $project: {
          "_id": "$_id",
          "room": "$room",
          "totalStudent": { $size: "$member.members" }
        }
      }
    ]).toArray()

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
}
