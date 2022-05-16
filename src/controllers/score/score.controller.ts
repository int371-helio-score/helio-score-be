import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { getScoreDto } from 'src/dto/score/create-score.dto';
import { upload } from 'src/services/common/common.service';
import { ScoreService } from '../../services/score/score.service';


@Controller('api/helio/score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], upload))
  importScore(@Body() request: any) {
    return this.scoreService.importScore(request)
  }

  @Get()
  getScoresByClass(@Body() param: getScoreDto) {
    try {
      return this.scoreService.getAllScoresByClassId(param.class_id)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
