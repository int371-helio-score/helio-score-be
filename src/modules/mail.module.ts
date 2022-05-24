import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailController } from 'src/controllers/mail/mail.controller';
import { Score } from 'src/entities/score.entity';
import { StudentList } from 'src/entities/student-list.entity';
import { MailService } from 'src/services/mail/mail.service';
import { ScoreService } from 'src/services/score/score.service';
import { StudentListService } from 'src/services/student-list/student-list.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'

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
        },
        template: {
            dir: './src/views',
            adapter: new HandlebarsAdapter(),
            options: {
                strict: true
            }
        }
    }), TypeOrmModule.forFeature([Score, StudentList])],
    controllers: [MailController],
    providers: [MailService, ScoreService, StudentListService]
})
export class MailModule { }
