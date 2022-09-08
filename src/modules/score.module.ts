import { Module } from '@nestjs/common';
import { ScoreService } from '../services/score/score.service';
import { ScoreController } from '../controllers/score/score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';
import { StudentList } from 'src/entities/student-list.entity';
import { StudentListService } from 'src/services/student-list/student-list.service';
import { Class } from 'src/entities/class.entity';
import { ClassService } from 'src/services/class/class.service';
import { SubjectService } from 'src/services/subject/subject.service';
import { Subject } from 'rxjs';
import { AcademicService } from 'src/services/academic/academic.service';
import { Academic } from 'src/entities/academic.entity';

@Module({
  controllers: [ScoreController],
  providers: [ScoreService, StudentListService, ClassService, SubjectService, AcademicService],
  imports: [TypeOrmModule.forFeature([Score, StudentList, Class, Subject, Academic])],
  exports: [ScoreService]
})
export class ScoreModule { }
