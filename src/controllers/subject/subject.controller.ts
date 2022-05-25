import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { getSubjectsByAcademicSemesterDto } from 'src/dto/subject/create-subject.dto';
import { SubjectService } from '../../services/subject/subject.service';

@Controller('api/helio/subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':semester/:academicYear')
  getSubjects(@Request() request: any, @Param() params: getSubjectsByAcademicSemesterDto) {
    try {
      return this.subjectService.getSubjectsByAcademicSemester(request.user.userId, params)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
