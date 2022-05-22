import { Module } from '@nestjs/common';
import { ScoreService } from '../services/score/score.service';
import { ScoreController } from '../controllers/score/score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';
import { StudentList } from 'src/entities/student-list.entity';
import { StudentListService } from 'src/services/student-list/student-list.service';

@Module({
  controllers: [ScoreController],
  providers: [ScoreService, StudentListService],
  imports: [TypeOrmModule.forFeature([Score, StudentList])],
  exports: [ScoreService]
})
export class ScoreModule { }
