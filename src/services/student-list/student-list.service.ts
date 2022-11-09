import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose from 'mongoose';
import { StudentList } from 'src/entities/student-list.entity';
import { MongoRepository } from 'typeorm';
import { getFileName } from '../common/common.service';
import * as fs from 'fs'
import { ClassService } from '../class/class.service';
import { SubjectService } from '../subject/subject.service';
import * as ExcelJS from 'exceljs'
import { UpdateStudentListDto } from 'src/dto/student-list/create-student-list.dto';

@Injectable()
export class StudentListService {
  constructor(
    @InjectRepository(StudentList)
    private repo: MongoRepository<StudentList>
  ) { }

  @Inject(forwardRef(() => ClassService))
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

    const cls = (await this.classService.find(classId))[0]
    if (!cls) {
      fs.unlinkSync(`./public/files/${fileName}`)
      return {
        statusCode: 404,
        message: "Class Not Found."
      }
    }
    const subj = (await this.subjectService.find(cls.subject.toString()))[0]
    if (!subj) {
      fs.unlinkSync(`./public/files/${fileName}`)
      return {
        statusCode: 404,
        message: "Subject Not Found."
      }
    }
    if (subj.owner.toString() !== user.userId) {
      fs.unlinkSync(`./public/files/${fileName}`)
      return {
        statusCode: 403,
        message: "You do not have permission."
      }

    }

    const workbook = new ExcelJS.Workbook()
    if (fileName.includes("csv")) {

      await workbook.csv.readFile(`./public/files/${fileName}`)

    } else {

      await workbook.xlsx.readFile(`./public/files/${fileName}`)

    }
    let sheet = workbook.getWorksheet(1)
    const firstRow = sheet.getRow(1).values

    const requiredList = ['เลขที่', 'รหัสนักเรียน', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'อีเมล']

    const isMatch = []
    for (const each of requiredList) {
      for (const col in firstRow) {
        if (each == firstRow[col]) {
          isMatch.push(each)
        }
      }
    }

    if (isMatch.length !== 6) {
      fs.unlinkSync(`./public/files/${fileName}`)
      return {
        statusCode: 400,
        message: "Missing required column(s)."
      }
    }

    const stdList = {
      groupName: groupName,
      owner: new mongoose.Types.ObjectId(user.userId),
      members: [],
      status: true
    }


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
    const result = await this.repo.findBy({ where: { owner: new mongoose.Types.ObjectId(user.userId), status: true } })

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

  async getStudentListById(userId: string, stdListId: string) {
    const result = await this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(stdListId), status: true } })

    if (!result) {
      return {
        statusCode: 404,
        message: "StudentList Not Found."
      }
    }

    if (result[0].owner.toString() !== userId) {
      return {
        statusCode: 403,
        message: "You do not have permission."
      }
    }

    const res = {
      _id: result[0]._id,
      groupName: result[0].groupName,
      members: result[0].members
    }

    return {
      statusCode: 200,
      message: "success",
      data: {
        total: result[0].members.length,
        results: res
      }
    }
  }

  async deleteStudentListById(stdListId: string) {
    const stdList = (await this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(stdListId) } }))[0]
    if (!stdList) {
      return {
        statusCode: 404,
        message: "StudentList Not Found."
      }
    }

    await this.repo.deleteOne({ _id: new mongoose.Types.ObjectId(stdListId) })

    return {
      statusCode: 200,
      message: "success"
    }
  }

  async find(userId: string) {
    try {
      return await this.repo.findBy({ where: { owner: new mongoose.Types.ObjectId(userId) } })
    } catch (err: any) {
      throw {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  async findOne(stdListId: string) {
    try {
      return await this.repo.findOneBy({ where: { _id: new mongoose.Types.ObjectId(stdListId) } })
    } catch (err: any) {
      throw {
        statusCode: err.statusCode,
        message: err.originalError
      }
    }
  }

  async updateStudentListById(userId: string, stdListId: string, stdList: UpdateStudentListDto) {
    const stdl = await this.findOne(stdListId)

    if (!stdl) {
      return {
        statusCode: 404,
        message: "StudentList Not Found."
      }
    }

    if (stdl.owner.toString() !== userId) {
      return {
        statusCode: 403,
        message: "You do not have permission."
      }
    }

    stdl.groupName = stdList.groupName

    await this.repo.save(stdl)

    return {
      statusCode: 200,
      message: "success"
    }
  }

  async hideStudentList(userId: string, stdListId: string) {
    const stdl = await this.findOne(stdListId)

    if (!stdl) {
      return {
        statusCode: 404,
        message: "StudentList Not Found."
      }
    }

    if (stdl.owner.toString() !== userId) {
      console.log(stdl.owner, userId);
      
      return {
        statusCode: 403,
        message: "You do not have permission."
      }
    }

    stdl.status = false

    await this.repo.save(stdl)

    return {
      statusCode: 200,
      message: "success"
    }
  }
}
