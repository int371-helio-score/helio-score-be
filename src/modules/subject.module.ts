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
import { MailService } from 'src/services/mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { AccountService } from 'src/services/account/account.service';
import { Account } from 'src/entities/account.entity';
import { lov } from 'src/entities/lov.entities';
import { School } from 'src/entities/school.entity';
import { SchoolService } from 'src/services/school/school.service';

@Module({
  controllers: [SubjectController],
  imports: [TypeOrmModule.forFeature([Subject, Academic, Class, Score, StudentList, Account, lov, School]),
  JwtModule.register({})],
  providers: [SubjectService, AcademicService, ClassService, ScoreService, StudentListService, MailService, AccountService, SchoolService],
  exports: [SubjectService]
})
export class SubjectModule { }
