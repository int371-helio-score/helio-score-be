import { Module } from '@nestjs/common';
import { StudentListService } from '../services/student-list/student-list.service';
import { StudentListController } from '../controllers/student-list/student-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentList } from 'src/entities/student-list.entity';

@Module({
  controllers: [StudentListController],
  providers: [StudentListService],
  imports: [TypeOrmModule.forFeature([StudentList])]
})
export class StudentListModule { }
