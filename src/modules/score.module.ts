import { Module } from '@nestjs/common';
import { ScoreService } from '../services/score/score.service';
import { ScoreController } from '../controllers/score/score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'src/entities/subject.entity';
import { SubjectService } from 'src/services/subject/subject.service';

@Module({
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule { }
