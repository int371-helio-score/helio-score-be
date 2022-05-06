import { Controller, Get } from '@nestjs/common';
import { ScoreService } from '../../services/score/score.service';

@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) { }

}
