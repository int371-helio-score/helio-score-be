import { Body, Controller, Inject, Post } from '@nestjs/common';
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

}
