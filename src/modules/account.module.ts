import { Module } from '@nestjs/common';
import { AccountService } from '../services/account/account.service';
import { AccountController } from '../controllers/account/account.controller';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs'
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { LocalStrategy } from 'src/auth/local.strategy';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { MailService } from 'src/services/mail/mail.service';
import { ScoreService } from 'src/services/score/score.service';
import { Score } from 'src/entities/score.entity';
import { StudentList } from 'src/entities/student-list.entity';
import { StudentListService } from 'src/services/student-list/student-list.service';
import { lov } from 'src/entities/lov.entities';
import { School } from 'src/entities/school.entity';
import { SchoolService } from 'src/services/school/school.service';
import { ClassService } from 'src/services/class/class.service';
import { Class } from 'src/entities/class.entity';
import { SubjectService } from 'src/services/subject/subject.service';
import { Subject } from 'src/entities/subject.entity';
import { AcademicService } from 'src/services/academic/academic.service';
import { Academic } from 'src/entities/academic.entity';

@Module({
  controllers: [AccountController],
  providers: [AccountService, MailService, ScoreService,
    StudentListService, SchoolService, ClassService,
    SubjectService, AcademicService,
    LocalStrategy, JwtStrategy],
  imports: [
    JwtModule.register({
      publicKey: fs.readFileSync(process.env.PUB_PATH, 'utf-8'),
      privateKey: fs.readFileSync(process.env.PRIV_PATH, 'utf-8'),
    }),
    PassportModule, TypeOrmModule.forFeature([Account, Score, StudentList, lov,
      School, Class, Subject, Academic])
  ],
  exports: [AccountService]
})
export class AccountModule { }
