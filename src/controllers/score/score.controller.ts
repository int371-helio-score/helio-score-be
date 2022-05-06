import { Controller, Get } from '@nestjs/common';
import { ScoreService } from '../../services/score/score.service';

@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) { }

  // @Get()
  // getScore() {
  //   return this.scoreService.getScore(`ObjectId("623ae9ee49e8c558751b65d1")`, `ObjectId("6242a5fc55bae7822d4b7e13")`, 'quiz1')
  // }
}
