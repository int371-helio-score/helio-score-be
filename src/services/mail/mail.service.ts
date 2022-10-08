import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScoreService } from '../score/score.service';

@Injectable()
export class MailService {
    @Inject()
    mailerService: MailerService
    @Inject()
    scoreService: ScoreService

    constructor(
        private jwtService: JwtService
    ) { }

    async announceByClassIdScoreTitle(class_id: string, scoreTitle: string) {
        try {
            const data = await this.scoreService.getScoresByClassScoreTitle(class_id, scoreTitle)

            const subject = {
                subjectCode: data[0].subject.subjectCode,
                subjectName: data[0].subject.subjectName,
                semester: data[0].subject.semester,
                class: {
                    grade: data[0].subject.grade,
                    room: data[0].class.room
                }
            }

            //for demo
            const title = data[0].title;
            const scoreTotal = data[0].total

            for (const each of data) {

                if (each.scores) {
                    await this.mailerService.sendMail({
                        to: each.scores.studentList.email,
                        subject: `Helio Score : ${subject.subjectName} ${title}`,
                        template: '/announce',
                        context: {
                            subjectName: subject.subjectName,
                            grade: subject.class.grade,
                            room: subject.class.room,
                            nameTitle: each.scores.studentList.title,
                            firstName: each.scores.studentList.firstName,
                            lastName: each.scores.studentList.lastName,
                            no: each.scores.studentList.no,
                            title: title,
                            score: each.scores.scores.score,
                            total: scoreTotal
                        }
                    })
                }

            }

            await this.scoreService.changeToAnnounced(data[0]._id)

            return {
                statusCode: 200,
                message: "Mail Sent Successful"
            }
        } catch (err: any) {
            return {
                statusCode: err.statuscode,
                message: err.originalError
            }
        }
    }

    async sendVerificationLink(email: string) {
        const payload = { email }
        const token = this.jwtService.sign(payload, {
            expiresIn: `${process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME}s`,
            issuer: 'helio-score-system',
            algorithm: 'HS256'
        })
        const url = `${process.env.EMAIL_VERIFICATION_URL}?token=${token}`

        this.mailerService.sendMail({
            to: email,
            subject: `Helio Score : Email Verification`,
            template: '/verify',
            context: {
                verifyUrl: url
            }
        })
    }

    async sendForgotPassword(email: string) {
        const payload = { email }
        const token = this.jwtService.sign(payload, {
            expiresIn: `1d`,
            issuer: 'helio-score-system',
            algorithm: 'HS256'
        })

        const url = `${process.env.FORGOT_PASSWORD_URL}?token=${token}`

        this.mailerService.sendMail({
            to: email,
            subject: `Helio Score: Forgot Password`,
            template: '/forgotPassword',
            context: {
                forgotUrl: url
            }
        })
    }
}
