import { Body, Controller, Get, Header, Param, Post, Res, UseGuards, Request, UseInterceptors, Patch, Delete } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DeleteScoreDto, EditScoreDto, getScoreDto, PublishScoreDto } from 'src/dto/score/create-score.dto';
import { upload } from 'src/services/common/common.service';
import { ScoreService } from '../../services/score/score.service';
import { Response } from 'express'
import * as fs from 'fs'

@Controller('api/helio/score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], upload))
  importScore(@Request() req: any, @Body() request: any) {
    try {
      return this.scoreService.importScore(req.user.userId, request)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('toAnnounce/:class_id')
  getScoresToAnnounceByClass(@Request() req: any, @Param() param: getScoreDto) {
    try {
      return this.scoreService.getScoresToPublishAnnounceByClass(req.user.userId, param.class_id, false)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('toPublish/:class_id')
  getScoresToPublishByClass(@Request() req: any, @Param() param: getScoreDto) {
    try {
      return this.scoreService.getScoresToPublishAnnounceByClass(req.user.userId, param.class_id, true)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('template/:class_id')
  @Header('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async getScoreTemplate(@Request() req: any, @Param() param: getScoreDto, @Res() res: Response) {
    try {
      const result: any = await this.scoreService.getScoreTemplate(req.user.userId, param.class_id)
      if (result.statusCode) {
        res.send(result)
        return res
      }
      res.download(`${result}`, function (err) {
        fs.unlinkSync(`./${result}`)
      })
      return {
        statusCode: 200,
        message: "success"
      }

    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':class_id')
  getScoresByClass(@Request() request: any, @Param() param: getScoreDto) {
    try {
      return this.scoreService.getAllScores(request.user, param.class_id)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async editScore(@Request() req: any, @Body() body: EditScoreDto) {
    try {
      return await this.scoreService.editScoreByScoreIdStdId(req.user.userId, body)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/publish')
  async publishScore(@Request() req: any, @Body() body: PublishScoreDto) {
    try {
      return this.scoreService.publishScoreByScoreId(req.user.userId, body)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':score_id')
  async deleteScoreByScoreId(@Request() req: any, @Param() param: DeleteScoreDto) {
    try {
      return await this.scoreService.deleteScoreByScoreId(param.score_id, req.user.userId)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

}
