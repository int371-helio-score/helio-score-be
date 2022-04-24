import { Module } from '@nestjs/common';
import { AcademicService } from '../services/academic/academic.service';
import { AcademicController } from '../controllers/academic/academic.controller';

@Module({
  controllers: [AcademicController],
  providers: [AcademicService]
})
export class AcademicModule {}
