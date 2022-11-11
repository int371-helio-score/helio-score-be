import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AcademicService } from '../../services/academic/academic.service';

@Controller('api/helio/academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAcademic(@Request() request: any) {
    try {
      return this.academicService.getAcademic(request.user)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':subjectId')
  async getAcademicAndSemesterBySubject(@Param('subjectId') param: string) {
    try {
      return this.academicService.getAcademicAndSemesterBySubjectId(param)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
