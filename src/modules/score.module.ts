import { Module } from '@nestjs/common';
import { ScoreService } from '../services/score/score.service';
import { ScoreController } from '../controllers/score/score.controller';

@Module({
  controllers: [ScoreController],
  providers: [ScoreService]
})
export class ScoreModule {}
