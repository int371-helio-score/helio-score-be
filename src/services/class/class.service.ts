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
      { $unwind: { path: "$member", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "_id": "$_id",
          "room": "$room",
          "totalStudent": {
            $cond: {
              if: "$member", then: { $size: "$member.members" }, else: 0
            }
          }
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

  async createClass(subjectId: string, classList: string[]) {
    let sid: any = subjectId;
    let re = false
    if (typeof subjectId !== new Object) {
      sid = new mongoose.Types.ObjectId(sid)
      re = true
    }
    for (const each of classList) {
      const obj = {
        room: each,
        studentList: [],
        subject: sid
      }
      await this.repo.save(obj)
    }
    if (!re) {

    }
    return {
      statusCode: 200,
      message: "success"
    }
  }

  async find(class_id: string) {
    try {
      return await this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(class_id) } })
    } catch (err: any) {
      throw {
        stausCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  async updateStudent(class_id: string, stdListId: string) {
    try {
      let result = await this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(class_id) } })
      result[0].studentList.push(new mongoose.Types.ObjectId(stdListId))
      await this.repo.save(result)
    } catch (err: any) {
      throw {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  async getStudentListByClassId(class_id: string) {
    const result = await this.repo.aggregate([
      { $match: { "_id": new mongoose.Types.ObjectId(class_id) } },
      {
        $lookup: {
          from: "studentList",
          localField: "studentList",
          foreignField: "_id",
          as: "studentList"
        }
      },
      { $unwind: "$studentList" }
    ]).toArray()
    return result
  }
}
