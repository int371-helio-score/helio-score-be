import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { ScoreService } from '../score/score.service';

@Injectable()
export class MailService {
    @Inject()
    mailerService: MailerService
    @Inject()
    scoreService: ScoreService

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

            const title = data[0].title
            //for demo

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
                to: data[0].scores.studentList.email,
                subject: `Helio Score : ${subject.subjectName} ${title}`,
                template: '/announce',
                context: {
                    subjectName: subject.subjectName,
                    grade: subject.class.grade,
                    room: subject.class.room,
                    nameTitle: data[0].scores.studentList.title,
                    firstName: data[0].scores.studentList.firstName,
                    lastName: data[0].scores.studentList.lastName,
                    no: data[0].scores.studentList.no,
                    title: title,
                    score: data[0].scores.scores.score,
                    total: data[0].total
                }
            })

            this.scoreService.changeToAnnounced(data[0].score_id)

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
}
