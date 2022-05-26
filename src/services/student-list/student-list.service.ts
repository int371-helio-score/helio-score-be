import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose from 'mongoose';
import { StudentList } from 'src/entities/student-list.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class StudentListService {
  constructor(
    @InjectRepository(StudentList)
    private repo: MongoRepository<StudentList>
  ) { }


  async getStudentListByClassId(class_id: string) {
    return await this.repo.aggregate([
      {
        $lookup: {
          from: "class",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", new mongoose.Types.ObjectId(class_id)]
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
          from: "subject",
          localField: "class.subject",
          foreignField: "_id",
          as: "subject"
        }
      },
      { $unwind: "$subject" },
      {
        $lookup: {
          from: "academic",
          localField: "subject._id",
          foreignField: "subjects",
          as: "academic"
        }
      },
      { $unwind: "$academic" }
    ]).toArray()
  }
}
