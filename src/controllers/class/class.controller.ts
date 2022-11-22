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
  @Get('/owner/:classId')
  async getClassOwnershipByClassId(@Request() request: any, @Param('classId') param: string) {
    try {
      return this.classService.getClassOwnershipByClassId(request.user.userId, param)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }

  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createClassInSubject(@Request() req: any, @Body() body: CreateClassDto) {
    try {
      return await this.classService.createClass(body.subjectId, body.class, req.user.userId)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stat/:classId')
  async getClassStat(@Request() req: any, @Param('classId') param: string) {
    try {
      return this.classService.getClassScoreStat(req.user.userId, param)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/record/:classId')
  async getClassStdList(@Request() req: any, @Param('classId') param: string) {
    try {
      return this.classService.getClassStdListStatus(req.user.userId, param)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async editClass(@Request() req: any, @Body() body: EditClassDto) {
    try {
      return await this.classService.editClass(req.user.userId, body)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':classId')
  async deleteClass(@Request() req: any, @Param('classId') classId: string) {
    try {
      return await this.classService.deleteClass(classId, req.user.userId)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
