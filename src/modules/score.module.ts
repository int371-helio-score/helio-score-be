import { Module } from '@nestjs/common';
import { ScoreService } from '../services/score/score.service';
import { ScoreController } from '../controllers/score/score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';
import { StudentList } from 'src/entities/student-list.entity';
import { StudentListService } from 'src/services/student-list/student-list.service';
import { AcademicService } from 'src/services/academic/academic.service';
import { Academic } from 'src/entities/academic.entity';
import { ClassService } from 'src/services/class/class.service';
import { Class } from 'src/entities/class.entity';
import { SubjectService } from 'src/services/subject/subject.service';
import { Subject } from 'src/entities/subject.entity';

@Module({
  controllers: [ScoreController],
  providers: [ScoreService, StudentListService, AcademicService, ClassService, SubjectService],
  imports: [TypeOrmModule.forFeature([Score, StudentList, Academic, Class, Subject])],
  exports: [ScoreService]
})
export class ScoreModule { }
