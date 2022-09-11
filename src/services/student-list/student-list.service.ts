import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose from 'mongoose';
import { StudentList } from 'src/entities/student-list.entity';
import { MongoRepository } from 'typeorm';
import { getFileName } from '../common/common.service';
import * as fs from 'fs'
import { CreateStudentListDto } from 'src/dto/student-list/create-student-list.dto';
import { ClassService } from '../class/class.service';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class StudentListService {
  constructor(
    @InjectRepository(StudentList)
    private repo: MongoRepository<StudentList>
  ) { }

  @Inject()
  classService: ClassService
  @Inject()
  subjectService: SubjectService

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

  async importStudentList(user: any, param: any) {
    const subjectId = param.subjectId
    const classId = param.classId

    const fileName = getFileName()

    if (fileName === "") {
      throw new BadRequestException('File is required.')
    }

    const source = fs.readFileSync(`./public/files/${fileName}`, 'utf-8')

    let data: any[] = []

    const lines = source.split('\n')

    const subjectResult = await this.subjectService.find(subjectId)

    const name = `ม.${subjectResult[0].grade} ${subjectResult[0].subjectName} ${subjectResult[0].semester}`

    const stdList = {
      groupName: name,
      owner: new mongoose.Types.ObjectId(user.userId),
      members: []
    }

    for (const line of lines) {

      if (line.length > 0) {
        const fields = line.split(',')
        data.push(fields)
      }
    }
    data = data.slice(1)
    for (const each of data) {

      const obj: CreateStudentListDto = {
        no: each[0],
        studentId: each[1],
        title: each[2],
        firstName: each[3],
        lastName: each[4],
        email: each[5]
      }

      stdList.members.push(obj)
    }

    await this.repo.save(stdList)

    fs.unlinkSync(`./public/files/${fileName}`)
    const result = (await this.repo.find({ order: { _id: -1 } }))[0]
    const str = JSON.stringify(result._id)
    const id = str.substring(str.indexOf('"') + 1, str.lastIndexOf('"'))
    await this.classService.updateStudent(classId, (id))

    return {
      statusCode: 200,
      message: "success",
      // data: {
      //   total: 1,
      //   results: {
      //     studentListId: result._id
      //   }
      // }
    }
  }
}
