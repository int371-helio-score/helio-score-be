import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { School } from 'src/entities/school.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private repo: MongoRepository<School>,
  ) { }

  async findAll() {
    const schoolList = []
    const result = await this.repo.find()
    for (const each of result) {
      schoolList.push({ schoolId: each.schoolId, schoolName: each.schoolName })
    }

    return {
      statusCode: 200,
      message: "success",
      data: {
        total: schoolList.length,
        results: schoolList
      }
    }
  }

}
