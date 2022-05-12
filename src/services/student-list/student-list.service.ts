import { Injectable } from '@nestjs/common';
import { CreateStudentListDto } from '../../dto/student-list/create-student-list.dto';
import { UpdateStudentListDto } from '../../dto/student-list/update-student-list.dto';

@Injectable()
export class StudentListService {
  create(createStudentListDto: CreateStudentListDto) {
    return 'This action adds a new StudentList';
  }

  findAll() {
    return `This action returns all StudentList`;
  }

  findOne(id: number) {
    return `This action returns a #${id} StudentList`;
  }

  update(id: number, updateStudentListDto: UpdateStudentListDto) {
    return `This action updates a #${id} StudentList`;
  }

  remove(id: number) {
    return `This action removes a #${id} StudentList`;
  }
}
