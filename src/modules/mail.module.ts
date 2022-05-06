import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailController } from 'src/controllers/mail/mail.controller';
import { Subject } from 'src/entities/subject.entity';
import { MailService } from 'src/services/mail/mail.service';
import { SubjectService } from 'src/services/subject/subject.service';

@Module({
    imports: [MailerModule.forRoot({
        transport: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GG_MAIL_USER,
                pass: process.env.GG_MAIL_PASS,
            },
        },
        defaults: {
            from: '"Helio Score System" <noreply.helioscoresystem.gmail.com>'
        }
    }), TypeOrmModule.forFeature([Subject])],
    controllers: [MailController],
    providers: [MailService, SubjectService]
})
export class MailModule { }
