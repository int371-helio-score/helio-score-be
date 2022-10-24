import { Body, Controller, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VerifyEmailDto } from 'src/dto/mail/create-mail.dto';
import { getScoreByClassScoreTitle } from 'src/dto/score/create-score.dto';
import { MailService } from 'src/services/mail/mail.service';

@Controller('api/helio/mail')
export class MailController {
  @Inject()
  mailService: MailService

  @UseGuards(JwtAuthGuard)
  @Post()
  announceByClassScoreTitle(@Request() req: any, @Body() params: getScoreByClassScoreTitle) {
    try {
      return this.mailService.announceByClassIdScoreTitle(req.user.userId, params.class_id, params.scoreTitle)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @Post('verify')
  async sendVerifyEmail(@Body() user: VerifyEmailDto) {
    try {
      this.mailService.sendVerificationLink(user.email)
      return {
        statusCode: 200,
        message: "success"
      }
    } catch (err: any) {
      return {
        statusCode: err.statusCode,
        message: err.originalError
      }
    }
  }

  @Post('forgotPassword')
  async forgotPassword(@Body() user: VerifyEmailDto) {
    try {
      return this.mailService.sendForgotPassword(user.email)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
