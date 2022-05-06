import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class MailService {
    @Inject()
    mailerService: MailerService
    @Inject()
    subjectService: SubjectService

    async sendMail(req: any) {
        const subjectId = req.subjectId
        const ownerId = req.ownerId
        const scoreTitle = req.scoreTitle
        try {
            const scores = await this.subjectService.getScore(subjectId, ownerId, scoreTitle)
            const subject = {
                subjectCode: scores[0].subjectCode,
                subjectName: scores[0].subjectName,
                semester: scores[0].semester,
                class: {
                    grade: scores[0].class.grade,
                    room: scores[0].class.room
                }
            }

            let title: string;
            let output: string;
            for (const each of scores) {
                if (each.score.length > 0) {
                    title = each.score[0].title

                    output = `
                    <h1> Helio Score </h1>
                    <h3> วิชา ${subject.subjectName} (${subject.subjectCode}) ภาคเรียนที่ ${subject.semester} ชั้นปี ${subject.class.grade} ห้อง ${subject.class.room}</h3>
                    <h4> รหัสประจำตัวนักเรียน : ${each.member.studentId} </h4>
                    <p> ${each.score[0].title} : ${each.score[0].score} </p>`
                }
                //sendMail

            }

            this.mailerService.sendMail({
                to: "thanyaluck.yict@mail.kmutt.ac.th",
                subject: `Helio Score : ${subject.subjectName} ${title}`,
                html: output
            })
            return {
                statusCode: 200,
                message: "Mail Sent Successful"
            }
        } catch (err) {
            return {
                statusCode: err.statuscode,
                message: err.originalError
            }
        }
    }
}
