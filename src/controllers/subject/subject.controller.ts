import { Body, Controller, Delete, Get, Patch, Post, Query, Request, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSubjectDto, EditSubjectDto, getSubjectsByAcademicSemesterDto } from 'src/dto/subject/create-subject.dto';
import { SubjectService } from '../../services/subject/subject.service';

@Controller('api/helio/subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getSubjects(@Request() request: any, @Query() params: getSubjectsByAcademicSemesterDto) {
    try {
      return this.subjectService.getSubjectsByAcademicSemester(request.user, params)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createSubject(@Request() request: any, @Body() body: CreateSubjectDto) {
    try {
      return this.subjectService.createSubject(request.user.userId, body)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  editSubject(@Body() body: EditSubjectDto) {
    try {
      return this.subjectService.editSubject(body)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':subjectId')
  deleteSubject(@Param('subjectId') subjectId: string) {
    try {
      return this.subjectService.deleteSubject(subjectId)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
