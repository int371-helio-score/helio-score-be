import { Body, Controller, Get, Header, Post, Res, UseGuards, Request, UseInterceptors, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ImportStudentListDto } from 'src/dto/student-list/create-student-list.dto';
import { StudentListService } from '../../services/student-list/student-list.service';
import { Response } from 'express'
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { upload } from 'src/services/common/common.service';

@Controller('api/helio/studentList')
export class StudentListController {
  constructor(private readonly StudentListService: StudentListService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllStudentList(@Request() request: any) {
    try {
      return this.StudentListService.getAllStudentListByOwner(request.user)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':listId')
  getStudentListById(@Param('listId') stdListId: string) {
    try {
      return this.StudentListService.getStudentListById(stdListId)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @Get('template')
  @Header('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
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
  async importStudentList(@Request() req: any, @Body() param: ImportStudentListDto) {
    try {
      return await this.StudentListService.importStudentList(req.user, param)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

}
