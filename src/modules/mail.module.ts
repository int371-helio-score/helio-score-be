import { MailerModule } from '@nestjs-modules/mailer';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailController } from 'src/controllers/mail/mail.controller';
import { MailService } from 'src/services/mail/mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { JwtModule } from '@nestjs/jwt';
import { Class } from 'src/entities/class.entity';
import { ClassService } from 'src/services/class/class.service';
import { Academic } from 'src/entities/academic.entity';
import { AcademicService } from 'src/services/academic/academic.service';
import { lov } from 'src/entities/lov.entities';
import { AccountModule } from './account.module';
import { ScoreModule } from './score.module';
import { SubjectModule } from './subject.module';
import { StudentListModule } from './student-list.module';
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
    }), TypeOrmModule.forFeature([Class, Academic, lov]),
    forwardRef(() => AccountModule), forwardRef(() => ScoreModule), forwardRef(() => SubjectModule), forwardRef(() => StudentListModule),
    JwtModule.register({
        secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
    })],
    controllers: [MailController],
    providers: [MailService, ClassService, AcademicService]
})
export class MailModule { }
