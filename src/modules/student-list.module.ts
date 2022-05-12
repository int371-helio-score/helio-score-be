import { Module } from '@nestjs/common';
import { StudentListService } from '../services/student-list/student-list.service';
import { StudentListController } from '../controllers/student-list/student-list.controller';

@Module({
  controllers: [StudentListController],
  providers: [StudentListService]
})
export class StudentListModule {}
