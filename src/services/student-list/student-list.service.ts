import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose from 'mongoose';
import { StudentList } from 'src/entities/student-list.entity';
import { MongoRepository } from 'typeorm';
import { getFileName } from '../common/common.service';
import * as fs from 'fs'
import { ClassService } from '../class/class.service';
import { SubjectService } from '../subject/subject.service';
import * as ExcelJS from 'exceljs'

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
          let: { "stdId": "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$stdId", "$studentList"]
                }, "_id": new mongoose.Types.ObjectId(class_id)
              }
            }
          ],
          as: "class"
        }
      },
      {
        $unwind: "$class"
      },
      {
        $project: {
          "class": 0
        }
      }
    ]).toArray()
  }

  async importStudentList(user: any, param: any) {
    const classId = param.classId
    const groupName = param.groupName

    const fileName = getFileName()

    if (fileName === "") {
      return new BadRequestException('File is required.')
    }
    const workbook = new ExcelJS.Workbook()
    if (fileName.includes("csv")) {

      await workbook.csv.readFile(`./public/files/${fileName}`)

    } else {

      await workbook.xlsx.readFile(`./public/files/${fileName}`)

    }

    const stdList = {
      groupName: groupName,
      owner: new mongoose.Types.ObjectId(user.userId),
      members: []
    }

    let sheet = workbook.getWorksheet(1)
    const lastRow = sheet.actualRowCount
    for (let row = 2; row < lastRow + 1; row++) {
      stdList.members.push({
        no: sheet.getColumn(1).values[row].toString(),
        studentId: sheet.getColumn(2).values[row].toString(),
        title: sheet.getColumn(3).values[row].toString(),
        firstName: sheet.getColumn(4).values[row].toString(),
        lastName: sheet.getColumn(5).values[row].toString(),
        email: sheet.getColumn(6).values[row].toString()
      })
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
    }
  }

  async getAllStudentListByOwner(user: any) {
    const res: any = []
    const result = await this.repo.findBy({ where: { owner: new mongoose.Types.ObjectId(user.userId) } })

    if (!result) {
      return {
        statusCode: 404,
        message: "No StudentList."
      }
    }

    for (const each of result) {
      const obj = {
        _id: each._id,
        groupName: each.groupName,
        total: each.members.length
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

  async getStudentListById(stdListId: string) {
    const result = await this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(stdListId) } })

    if (!result) {
      return {
        statusCode: 404,
        message: "StudentList Not Found."
      }
    }

    return {
      statusCode: 200,
      message: "success",
      data: {
        total: result[0].members.length,
        results: result[0].members
      }
    }
  }
}
