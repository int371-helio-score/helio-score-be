import { Controller, Get } from '@nestjs/common';
import { SchoolService } from '../../services/school/school.service';

@Controller('/api/helio/school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) { }

  @Get()
  findAll() {
    try {
      return this.schoolService.findAll();
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

}
