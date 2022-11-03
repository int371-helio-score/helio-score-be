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
import { MailService } from 'src/services/mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { Account } from 'src/entities/account.entity';
import { AccountService } from 'src/services/account/account.service';
import { lov } from 'src/entities/lov.entities';
import { School } from 'src/entities/school.entity';
import { SchoolService } from 'src/services/school/school.service';

@Module({
  controllers: [ScoreController],
  providers: [ScoreService, StudentListService, AcademicService, ClassService, SubjectService, MailService, AccountService, SchoolService],
  imports: [TypeOrmModule.forFeature([Score, StudentList, Academic, Class, Subject, Account, lov, School]),
  JwtModule.register({})],
  exports: [ScoreService]
})
export class ScoreModule { }
