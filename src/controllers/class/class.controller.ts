import { Body, Controller, Get, Param, Post, Request, UseGuards, Patch, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateClassDto, EditClassDto, GetAllClassBySubjectDto } from 'src/dto/class/create-class.dto';
import { ClassService } from '../../services/class/class.service';

@Controller('api/helio/class')
export class ClassController {
  constructor(private readonly classService: ClassService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':subject_id')
  async getAllClass(@Request() request: any, @Param() param: GetAllClassBySubjectDto) {
    try {
      return this.classService.getAllClassBySubject(request.user, param.subject_id)
    } catch (err: any) {
      return {
        statusCode: err.statusCode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createClassInSubject(@Body() body: CreateClassDto) {
    try {
      return await this.classService.createClass(body.subjectId, body.class)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async editClass(@Body() body: EditClassDto) {
    try {
      return await this.classService.editClass(body)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':classId')
  async deleteClass(@Param('classId') classId: string) {
    try {
      return await this.classService.deleteClass(classId)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
