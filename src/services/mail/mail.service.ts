import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from '../account/account.service';
import { ClassService } from '../class/class.service';
import { ScoreService } from '../score/score.service';
import { StudentListService } from '../student-list/student-list.service';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class MailService {
    @Inject()
    mailerService: MailerService
    @Inject(forwardRef(() => ScoreService))
    scoreService: ScoreService
    @Inject(forwardRef(() => AccountService))
    accountService: AccountService
    @Inject()
    classService: ClassService
    @Inject(forwardRef(() => SubjectService))
    subjectService: SubjectService
    @Inject((forwardRef(() => StudentListService)))
    studentListService: StudentListService

    constructor(
        private jwtService: JwtService
    ) { }

    async announceByClassIdScoreId(userId: string, scoreId: string) {
        const sc = await this.scoreService.findOne(scoreId)
        if (!sc) {
            return {
                statusCode: 404,
                message: "Score Not Found."
            }
        }

        const cls = (await this.classService.find(sc.class.toString()))[0]
        if (!cls) {
            return {
                statusCode: 404,
                message: "Class Not Found."
            }
        }
        const subj = (await this.subjectService.find(cls.subject.toString()))[0]
        if (!subj) {
            return {
                statusCode: 404,
                message: "Subject Not Found."
            }
        }
        if (subj.owner.toString() !== userId) {
            return {
                statusCode: 403,
                message: "You do not have permission."
            }

        }

        const subject = {
            subjectCode: subj.subjectCode,
            subjectName: subj.subjectName,
            semester: subj.semester,
            class: {
                grade: subj.grade,
                room: cls.room
            }
        }

        const title = sc.title;
        const scoreTotal = sc.total

        const list: any[] = []
        const allScores: any[] = [];
        const stdList = await this.studentListService.findOne(cls.studentList.toString())

        for (const each of sc.scores) {
            const std = stdList.members.find((el) => el.studentId === each.studentId)
            const scores = {
                no: std.no,
                studentId: each.studentId,
                title: std.title,
                firstName: std.firstName,
                lastName: std.lastName,
                email: std.email,
                score: each.score == -1 ? "ไม่มีคะแนน" : each.score
            }
            allScores.push(each.score)
            list.push(scores)
        }

        if (list.length !== stdList.members.length) {
            const std: any = stdList.members.filter((el) => !list.some((e) => el.studentId === e.studentId))
            for (const each of std) {
                each.score = "ไม่มีคะแนน"
                list.push(each)
            }
        }

        const min = Math.min(...allScores)
        const max = Math.max(...allScores)
        const average = Number((allScores.reduce((a: any, b: any) => a + b, 0) / allScores.length).toFixed(2))

        for (const each of list) {
            await this.mailerService.sendMail({
                to: each.email,
                subject: `Helio Score: ${subject.subjectName} ${title}`,
                template: '/announce',
                context: {
                    subjectName: subject.subjectName,
                    grade: subject.class.grade,
                    room: subject.class.room,
                    nameTitle: each.title,
                    firstName: each.firstName,
                    lastName: each.lastName,
                    no: each.no,
                    title: title,
                    score: each.score,
                    total: scoreTotal,
                    min: min,
                    max: max,
                    avg: average
                }
            })
        }

        await this.scoreService.changeToAnnounced(sc._id)

        return {
            statusCode: 200,
            message: "success"
        }
    }

    async sendVerificationLink(email: string) {
        const payload = { email }
        const token = this.jwtService.sign(payload, {
            expiresIn: `${process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME}s`,
            issuer: 'helio-score-system',
            algorithm: 'HS256',
            secret: `${process.env.JWT_VERIFICATION_TOKEN_SECRET}`
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
        const user = await this.accountService.findOne(email)
        if (!user) {
            throw new BadRequestException('Invalid Email.')
        }
        else if (user.googleId) {
            throw new ForbiddenException("Google account was not connected to user's account.")
        } else {

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
        return {
            statusCode: 200,
            message: "success"
        }
    }
}
