import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mongoose from 'mongoose';
import { StudentMember } from 'src/dto/student-list/create-student-list.dto';
import { StudentList } from 'src/entities/student-list.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class StudentListService {
  constructor(
    @InjectRepository(StudentList)
    private repo: MongoRepository<StudentList>
  ) { }

  async getStudentListByClassId(class_id: string) {
    const res: any[] = []

    const result = await this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(class_id) } })

    if (result.length == 0) {
      return {
        statusCode: 404,
        message: "No Records."
      }
    }

    let data = {
      _id: "",
      members: []
    }

    for (const each of result) {
      data._id = each._id
      for (const std of each.members) {
        const obj: StudentMember = {
          no: std.no,
          studentId: std.studentId,
          title: std.title,
          firstName: std.firstName,
          lastName: std.lastName
        }
        data.members.push(obj)
      }
      res.push(data)
    }

    return {
      statusCode: 200,
      message: "success",
      data: {
        total: result.length,
        results: res
      }
    }
  }
}
