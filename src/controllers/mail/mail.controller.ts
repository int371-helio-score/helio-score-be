import { Body, Controller, Inject, Post } from '@nestjs/common';
import { MailService } from 'src/services/mail/mail.service';

@Controller('mail')
export class MailController {
    @Inject()
    mailService: MailService

    @Post()
    sendMail(@Body() request: any) {
        return this.mailService.sendMail(request)
    }
}
