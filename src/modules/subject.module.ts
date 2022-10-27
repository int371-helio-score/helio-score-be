import { Module } from '@nestjs/common';
import { SubjectService } from '../services/subject/subject.service';
import { SubjectController } from '../controllers/subject/subject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'src/entities/subject.entity';
import { AcademicService } from 'src/services/academic/academic.service';
import { Academic } from 'src/entities/academic.entity';
import { ClassService } from 'src/services/class/class.service';
import { Class } from 'src/entities/class.entity';
import { Score } from 'src/entities/score.entity';
import { ScoreService } from 'src/services/score/score.service';
import { StudentList } from 'src/entities/student-list.entity';
import { StudentListService } from 'src/services/student-list/student-list.service';

@Module({
  controllers: [SubjectController],
  imports: [TypeOrmModule.forFeature([Subject, Academic, Class, Score, StudentList])],
  providers: [SubjectService, AcademicService, ClassService, ScoreService, StudentListService],
  exports: [SubjectService]
})
export class SubjectModule { }
