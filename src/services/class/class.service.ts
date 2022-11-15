import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose from 'mongoose';
import { EditClassDto } from 'src/dto/class/create-class.dto';
import { Class } from 'src/entities/class.entity';
import { MongoRepository } from 'typeorm';
import { ScoreService } from '../score/score.service';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private repo: MongoRepository<Class>
  ) { }

  @Inject(forwardRef(() => SubjectService))
  subjectService: SubjectService

  @Inject(forwardRef(() => ScoreService))
  scoreService: ScoreService

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
            },
            "owner": 'true'
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
          "room": "$room",
          "owner": 'false'
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

    result.forEach((each: any) => {
      each.owner = JSON.parse(each.owner)
    })

    return {
      statusCode: 200,
      message: "success",
      data: {
        total: result.length,
        results: result
      }
    }

  }

  async createClass(subjectId: string, classList: string[], userId?: string) {
    if (classList.length == 0) {
      return {
        statusCode: 400,
        message: "Class is required."
      }
    }

    const subj = (await this.subjectService.find(subjectId))[0]

    if (!subj) {
      return {
        statusCode: 404,
        message: "Subject Not Found."
      }
    }

    if (userId) {
      if (subj.owner.toString() !== userId) {
        return {
          statusCode: 403,
          message: "You do not have permission."
        }

      }
    }

    let sid: any = subjectId;

    if (typeof subjectId !== new Object) {
      sid = new mongoose.Types.ObjectId(sid)

    }

    for (const each of classList) {
      const obj = {
        room: each,
        studentList: [],
        subject: sid
      }
      await this.repo.save(obj)
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
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  async findBySubjectId(subjectId: string) {
    try {
      return await this.repo.findBy({ where: { subject: new mongoose.Types.ObjectId(subjectId) } })
    } catch (err: any) {
      throw {
        statusCode: err.statuscode,
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

  async editClass(userId: string, body: EditClassDto) {
    const cls = (await this.find(body.classId))[0]

    if (!cls) {
      return {
        statusCode: 404,
        message: "Class Not Found."
      }
    }

    const subj = await this.subjectService.find(cls.subject.toString())
    if (!subj) {
      return {
        statusCode: 404,
        message: "Subject Not Found."
      }
    }

    if (subj[0].owner.toString() !== userId) {
      return {
        statusCode: 403,
        message: "You do not have permission."
      }

    }

    cls.room = body.room

    await this.repo.save(cls)

    return {
      statusCode: 200,
      message: "success"
    }
  }

  async deleteClass(classId: string, userId?: string) {
    const cls = (await this.find(classId))[0]

    if (!cls) {
      return {
        statusCode: 404,
        message: "Class Not Found."
      }
    }

    if (userId) {
      const subj = (await this.subjectService.find(cls.subject.toString()))[0]

      if (!subj) {
        return {
          statusCode: 404,
          message: "Subject Not Found."
        }
      }

      if (subj.owner.toString() !== userId) {
        return {
          statusCode: 403,
          message: "You do not have permission."
        }

      }

    }

    const scoreList = await this.scoreService.find(cls._id.toString())
    if (scoreList) {
      for (const each of scoreList) {
        await this.scoreService.deleteScoreByScoreId(each._id)
      }
    }

    await this.repo.delete({ _id: cls._id })

    return {
      statusCode: 200,
      message: "success"
    }
  }

  async getClassOwnershipByClassId(userId: string, classId: string) {
    const cls = (await this.find(classId))[0]
    const subj = (await this.subjectService.find(cls.subject.toString()))[0]

    return {
      statusCode: 200,
      message: "success",
      data: {
        results: {
          owner: subj.owner.toString() == userId
        }
      }
    }
  }

  async getClassScoreStat(userId: string, classId: string) {
    const cls = (await this.find(classId))[0]
    if (!cls) {
      return {
        statusCode: 404,
        message: "Class Not Found."
      }
    }

    const subj = (await this.subjectService.find(cls.subject.toString()))[0]
    if (!subj) {
      return {
        statusCode: 404,
        message: "Subject Not Found."
      }
    }

    let total = 0;
    const allScores: any[] = []
    const all: any[] = []
    let score

    if (subj.owner.toString() !== userId) {
      score = await this.scoreService.findByClassOnlyPublished(classId)
    } else {
      score = await this.scoreService.find(classId)
    }

    for (const each of score) {
      total += Number(each.total)
      for (const s of each.scores) {
        if (!isNaN(Number(s.score))) {
          all.push(s)
          allScores.push(Number(s.score))
        }
      }
    }

    const stdGroup = all.reduce((r: any, a: any) => {
      r[a.studentId] = [...r[a.studentId] || [], a]
      return r
    }, {})

    let eachStdTotal: any[] = []
    Object.keys(stdGroup).forEach((key) => {
      let totalScore = 0
      for (const each of stdGroup[key]) {
        totalScore += Number(each.score)
      }

      eachStdTotal.push(totalScore)
    })

    const result = {
      totalScore: total,
      min: Math.min(...eachStdTotal),
      max: Math.max(...eachStdTotal),
      average: Number((allScores.reduce((a: any, b: any) => a + b, 0) / eachStdTotal.length).toFixed(2))
    }

    return {
      statusCode: 200,
      message: "success",
      data: {
        total: 1,
        results: result
      }
    }

  }
}
