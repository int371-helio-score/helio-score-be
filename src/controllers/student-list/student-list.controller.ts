import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { getStudentListByClassDto } from 'src/dto/student-list/create-student-list.dto';
import { StudentListService } from '../../services/student-list/student-list.service';

@Controller('api/helio/studentList')
export class StudentListController {
  constructor(private readonly StudentListService: StudentListService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getStudentListByClass(@Body() param: getStudentListByClassDto) {
    try {
      return this.StudentListService.getStudentListByClassId(param.class_id)
    } catch (err: any) {
      return {
        statusCode: err.stauscode,
        message: err.originalError
      }
    }
  }

}
