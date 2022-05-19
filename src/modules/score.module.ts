import { Module } from '@nestjs/common';
import { ScoreService } from '../services/score/score.service';
import { ScoreController } from '../controllers/score/score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';

@Module({
  controllers: [ScoreController],
  providers: [ScoreService],
  imports: [TypeOrmModule.forFeature([Score])],
  exports: [ScoreService]
})
export class ScoreModule { }
