import { Body, Controller, Get, Header, Post, Res, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { getStudentListByClassDto, ImportStudentListDto } from 'src/dto/student-list/create-student-list.dto';
import { StudentListService } from '../../services/student-list/student-list.service';
import { Response } from 'express'
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { upload } from 'src/services/common/common.service';

@Controller('api/helio/studentList')
export class StudentListController {
  constructor(private readonly StudentListService: StudentListService) { }

  /**
   * Need to be fix
   * Not used in release 1
   * @deprecated
   */
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

  @Get('template')
  @Header('Content-type', 'text/xlsx')
  async getStudentListTemplate(@Res() res: Response) {
    try {
      res.download('./public/files/helio-studentList-template.xlsx')
      return {
        statusCode: 200,
        message: "success"
      }
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], upload)
  )
  async importStudentList(@Request() req: any, @Body() body: ImportStudentListDto) {
    try {
      return await this.StudentListService.importStudentList(req.user, body.groupName)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

}
