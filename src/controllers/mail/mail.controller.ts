import { Body, Controller, Inject, Post } from '@nestjs/common';
import { VerifyEmailDto } from 'src/dto/mail/create-mail.dto';
import { getScoreByClassScoreTitle } from 'src/dto/score/create-score.dto';
import { MailService } from 'src/services/mail/mail.service';

@Controller('api/helio/mail')
export class MailController {
    @Inject()
    mailService: MailService

    @Post()
    announceByClassScoreTitle(@Body() params: getScoreByClassScoreTitle) {
        return this.mailService.announceByClassIdScoreTitle(params.class_id, params.scoreTitle)
    }

    @Post('verify')
    async sendVerifyEmail(@Body() user: VerifyEmailDto) {
        try {
            this.mailService.sendVerificationLink(user.email)
            return {
                statusCode: 200,
                message: "Mail has been sent."
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
