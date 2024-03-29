import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config/ormconfig';
import { AccountModule } from './modules/account.module';
import { SchoolModule } from './modules/school.module';
import { SubjectModule } from './modules/subject.module';
import { ClassModule } from './modules/class.module';
import { StudentListModule } from './modules/student-list.module';
import { AcademicModule } from './modules/academic.module';
import { ScoreModule } from './modules/score.module';
import { MailModule } from './modules/mail.module';
import { CommonModule } from './modules/common.module';
import { ConfigModule } from '@nestjs/config'
import { HealthModule } from './modules/health.module';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: `${process.cwd()}/env/.env` }),
  TypeOrmModule.forRoot(config),
    AccountModule,
    SchoolModule,
    SubjectModule,
    ClassModule,
    StudentListModule,
    AcademicModule,
    ScoreModule,
    MailModule,
    CommonModule,
    HealthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
