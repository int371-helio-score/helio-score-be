import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { upload } from 'src/services/common/common.service';
import { ScoreService } from '../../services/score/score.service';


@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], upload))
  importScore(@Body() request: any) {
    return this.scoreService.importScore(request)
  }
}
