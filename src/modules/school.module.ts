import { Module } from '@nestjs/common';
import { SchoolService } from '../services/school/school.service';
import { SchoolController } from '../controllers/school/school.controller';

@Module({
  controllers: [SchoolController],
  providers: [SchoolService]
})
export class SchoolModule {}
