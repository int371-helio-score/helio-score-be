import { Module } from '@nestjs/common';
import { SubjectService } from '../services/subject/subject.service';
import { SubjectController } from '../controllers/subject/subject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'src/entities/subject.entity';

@Module({
  controllers: [SubjectController],
  imports: [TypeOrmModule.forFeature([Subject])],
  providers: [SubjectService],
  exports: [SubjectService]
})
export class SubjectModule { }
