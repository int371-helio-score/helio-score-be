import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose from 'mongoose';
import { EditClassDto } from 'src/dto/class/create-class.dto';
import { Class } from 'src/entities/class.entity';
import { MongoRepository } from 'typeorm';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private repo: MongoRepository<Class>
  ) { }

  @Inject(forwardRef(() => SubjectService))
  subjectService: SubjectService

  async getAllClassBySubject(user: any, subject_id: string) {
    let result: any = []
    const subject = await this.subjectService.find(subject_id)

    //if isOwner
    if (subject[0].owner.toString() === user.userId) {
      result = await this.repo.aggregate([
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
    } else {
      result = await this.repo.aggregate([{ $match: { subject: new mongoose.Types.ObjectId(subject_id) } },
      {
        $lookup: {
          from: "studentList",
          let: { std: "$studentList" },
          pipeline: [{
            $match: {
              $expr: {
                $in: ["$_id", "$$std"]
              }, "members.email": user.email
            }
          }],
          as: "member"
        }
      },
      { $unwind: "$member" },
      {
        $project: {
          "_id": "$_id",
          "room": "$room"
        }
      }
      ]).toArray()
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
    return await this.repo.aggregate([
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
  }

  async editClass(body: EditClassDto) {
    const cls = (await this.find(body.classId))[0]

    if (cls === undefined) {
      return {
        statusCode: 404,
        message: "Class Not Found."
      }
    }

    cls.room = body.room

    await this.repo.save(cls)

    return {
      statusCode: 200,
      message: "success"
    }
  }

  async deleteClass(classId: string) {
    const cls = (await this.find(classId))[0]

    if (cls === undefined) {
      return {
        statusCode: 404,
        message: "Class Not Found."
      }
    }
    await this.repo.delete({ _id: cls._id })

    return {
      statusCode: 200,
      message: "success"
    }
  }
}
