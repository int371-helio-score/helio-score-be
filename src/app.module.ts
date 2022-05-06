import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config/ormconfig';
import { AccountModule } from './modules/account.module';
import { SchoolModule } from './modules/school.module';
import { SubjectModule } from './modules/subject.module';
import { ClassModule } from './modules/class.module';
import { ListMemberModule } from './modules/list-member.module';
import { GroupModule } from './modules/group.module';
import { AcademicModule } from './modules/academic.module';
import { ScoreModule } from './modules/score.module';
import { MailModule } from './modules/mail.module';
import { CommonModule } from './modules/common.module';

@Module({
  imports: [TypeOrmModule.forRoot(config),
    AccountModule,
    SchoolModule,
    SubjectModule,
    ClassModule,
    ListMemberModule,
    GroupModule,
    AcademicModule,
    ScoreModule,
    MailModule,
    CommonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
