import { BadRequestException, Body, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { getAcademicByOwnerDto } from 'src/dto/academic/create-academic.dto';
import { AcademicService } from '../../services/academic/academic.service';

@Controller('api/helio/academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAcademicByOwner(@Body() request: getAcademicByOwnerDto) {
    try {
      return this.academicService.getAcademicByOwner(request)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
