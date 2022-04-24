import { Module } from '@nestjs/common';
import { SubjectService } from '../services/subject/subject.service';
import { SubjectController } from '../controllers/subject/subject.controller';

@Module({
  controllers: [SubjectController],
  providers: [SubjectService]
})
export class SubjectModule {}
