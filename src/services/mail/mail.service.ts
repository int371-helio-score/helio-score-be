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
            const data = await this.subjectService.getScore(subjectId, ownerId, scoreTitle)

            const subject = {
                subjectCode: data[0].subjectCode,
                subjectName: data[0].subjectName,
                semester: data[0].semester,
                class: {
                    grade: data[0].class.grade,
                    room: data[0].class.room
                }
            }

            let title: string;
            let output: string;

            title = data[0].title
            //for demo
            output = `<h1> Helio Score </h1>
                    <h3> วิชา ${subject.subjectName} (${subject.subjectCode}) ภาคเรียนที่ ${subject.semester} ชั้นปี ${subject.class.grade} ห้อง ${subject.class.room}</h3>
                    <h4> รหัสประจำตัวนักเรียน : ${data[0].stdScore.scores.studentId} </h4>
                    <p> ${title} : ${data[0].stdScore.scores.score} </p>`
            // for (const each of scores) {
            //     if (each.score.length > 0) {
            //         title = each.score[0].title

            //         output = `
            //         <h1> Helio Score </h1>
            //         <h3> วิชา ${subject.subjectName} (${subject.subjectCode}) ภาคเรียนที่ ${subject.semester} ชั้นปี ${subject.class.grade} ห้อง ${subject.class.room}</h3>
            //         <h4> รหัสประจำตัวนักเรียน : ${each.member.studentId} </h4>
            //         <p> ${each.score[0].title} : ${each.score[0].score} </p>`
            //     }
            //     //sendMail

            // }

            this.mailerService.sendMail({
                to: data[0].stdScore.member.email,
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
