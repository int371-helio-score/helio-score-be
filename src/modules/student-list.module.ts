import { Module } from '@nestjs/common';
import { StudentListService } from '../services/student-list/student-list.service';
import { StudentListController } from '../controllers/student-list/student-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentList } from 'src/entities/student-list.entity';
import { ClassService } from 'src/services/class/class.service';
import { Class } from 'src/entities/class.entity';
import { SubjectService } from 'src/services/subject/subject.service';
import { AcademicService } from 'src/services/academic/academic.service';
import { Academic } from 'src/entities/academic.entity';
import { Subject } from 'src/entities/subject.entity';

@Module({
  controllers: [StudentListController],
  providers: [StudentListService, ClassService, SubjectService, AcademicService],
  imports: [TypeOrmModule.forFeature([StudentList, Class, Subject, Academic])],
  exports: [StudentListService]
})
export class StudentListModule { }
