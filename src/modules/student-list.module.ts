import { Module, forwardRef } from '@nestjs/common';
import { StudentListService } from '../services/student-list/student-list.service';
import { StudentListController } from '../controllers/student-list/student-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentList } from 'src/entities/student-list.entity';
import { SubjectService } from 'src/services/subject/subject.service';
import { AcademicService } from 'src/services/academic/academic.service';
import { Academic } from 'src/entities/academic.entity';
import { Subject } from 'src/entities/subject.entity';
import { ScoreService } from 'src/services/score/score.service';
import { Score } from 'src/entities/score.entity';
import { ClassModule } from './class.module';
import { MailService } from 'src/services/mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { AccountService } from 'src/services/account/account.service';
import { Account } from 'src/entities/account.entity';
import { lov } from 'src/entities/lov.entities';
import { School } from 'src/entities/school.entity';
import { SchoolService } from 'src/services/school/school.service';

@Module({
  controllers: [StudentListController],
  providers: [StudentListService, SubjectService, AcademicService, ScoreService, MailService, AccountService, SchoolService],
  imports: [TypeOrmModule.forFeature([StudentList, Subject, Academic, Score, Account, lov, School]), forwardRef(() => ClassModule),
  JwtModule.register({})],
  exports: [StudentListService]
})
export class StudentListModule { }
