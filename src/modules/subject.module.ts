import { Module } from '@nestjs/common';
import { SubjectService } from '../services/subject/subject.service';
import { SubjectController } from '../controllers/subject/subject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'src/entities/subject.entity';
import { AcademicService } from 'src/services/academic/academic.service';
import { Academic } from 'src/entities/academic.entity';
import { ClassService } from 'src/services/class/class.service';
import { Class } from 'src/entities/class.entity';

@Module({
  controllers: [SubjectController],
  imports: [TypeOrmModule.forFeature([Subject, Academic, Class])],
  providers: [SubjectService, AcademicService, ClassService],
  exports: [SubjectService]
})
export class SubjectModule { }
