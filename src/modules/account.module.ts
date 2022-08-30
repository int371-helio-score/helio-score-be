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
import { GoogleStrategy } from 'src/auth/google.strategy';
import { MailService } from 'src/services/mail/mail.service';
import { ScoreService } from 'src/services/score/score.service';
import { Score } from 'src/entities/score.entity';
import { StudentList } from 'src/entities/student-list.entity';
import { StudentListService } from 'src/services/student-list/student-list.service';
import { lov } from 'src/entities/lov.entities';

@Module({
  controllers: [AccountController],
  providers: [AccountService, MailService, ScoreService, StudentListService,
    LocalStrategy, JwtStrategy, GoogleStrategy],
  imports: [
    JwtModule.register({
      publicKey: fs.readFileSync(process.env.PUB_PATH, 'utf-8'),
      privateKey: fs.readFileSync(process.env.PRIV_PATH, 'utf-8'),
    }),
    PassportModule, TypeOrmModule.forFeature([Account, Score, StudentList, lov])
  ],
  exports: [AccountService]
})
export class AccountModule { }
