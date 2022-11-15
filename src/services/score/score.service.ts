import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { getFileName } from '../common/common.service';
import * as fs from 'fs'
import { InjectRepository } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';
import { MongoRepository } from 'typeorm';
import mongoose from 'mongoose';
import * as ExcelJS from 'exceljs'
import { StudentListService } from '../student-list/student-list.service';
import * as tmp from 'tmp'
import { ClassService } from '../class/class.service';
import { SubjectService } from '../subject/subject.service';
import { EditScoreDto, PublishScoreDto } from 'src/dto/score/create-score.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ScoreService {
    constructor(
        @InjectRepository(Score)
        private repo: MongoRepository<Score>
    ) { }

    @Inject()
    studentListService: StudentListService
    @Inject(forwardRef(() => ClassService))
    classService: ClassService
    @Inject(forwardRef(() => SubjectService))
    subjectService: SubjectService
    @Inject(forwardRef(() => MailService))
    mailService: MailService

    async importScore(userId: string, req: any) {
        const classId = req.class_id

        const fileName = getFileName()
        if (fileName === "") {
            throw new BadRequestException('File is required.')
        }

        const cls = (await this.classService.find(classId))[0]
        if (!cls) {
            fs.unlinkSync(`./public/files/${fileName}`)
            return {
                statusCode: 404,
                message: "Class Not Found."
            }
        }
        const subj = (await this.subjectService.find(cls.subject.toString()))[0]
        if (!subj) {
            fs.unlinkSync(`./public/files/${fileName}`)
            return {
                statusCode: 404,
                message: "Subject Not Found."
            }
        }
        if (subj.owner.toString() !== userId) {
            fs.unlinkSync(`./public/files/${fileName}`)
            return {
                statusCode: 403,
                message: "You do not have permission."
            }

        }

        const workbook = new ExcelJS.Workbook()
        if (fileName.includes("csv")) {

            await workbook.csv.readFile(`./public/files/${fileName}`)

        } else {

            await workbook.xlsx.readFile(`./public/files/${fileName}`)

        }
        const requiredList = ['เลขที่', 'รหัสนักเรียน', 'คำนำหน้า', 'ชื่อ', 'นามสกุล']

        let sheet = workbook.getWorksheet(1)

        const firstRow = sheet.getRow(1).values

        const isMatch = []
        for (const each of requiredList) {
            for (const col in firstRow) {
                if (each == firstRow[col]) {
                    isMatch.push(each)
                }

            }
        }

        if (isMatch.length !== 5) {
            fs.unlinkSync(`./public/files/${fileName}`)
            return {
                statusCode: 400,
                message: "Missing required column(s)."
            }
        }

        const lastRow = sheet.actualRowCount

        if (sheet.getColumn(6).values[1] === undefined) {
            fs.unlinkSync(`./public/files/${fileName}`)
            throw new BadRequestException('Score is require.')
        }

        //check if score > total
        for (let col = 6; col < sheet.actualColumnCount + 1; col++) {
            for (let row = 2; row < lastRow; row++) {
                if (sheet.getColumn(col).values[lastRow] < sheet.getColumn(col).values[row]) {
                    fs.unlinkSync(`./public/files/${fileName}`)
                    return {
                        statusCode: 400,
                        message: "Score is greater than full marks."
                    }
                }
            }

        }

        for (let col = 6; col < sheet.actualColumnCount + 1; col++) {
            if (sheet.getColumn(col).values[lastRow] === undefined) {
                continue
            }

            //score Title
            const work = sheet.getColumn(col).values[1].toString()
            const obj: any = {
                title: work,
                total: Number(sheet.getColumn(col).values[lastRow]),
                class: new mongoose.Types.ObjectId(classId),
                scores: [],
                publish: false,
                announce: false
            }

            for (let row = 2; row < lastRow; row++) {
                obj.scores.push({
                    studentId: sheet.getColumn(2).values[row].toString(),
                    score: sheet.getColumn(col).values[row] === undefined ? "ไม่มีคะแนน" : sheet.getColumn(col).values[row].toString()
                })
            }

            const result = await this.repo.findBy({ where: { title: work, class: new mongoose.Types.ObjectId(classId) } })
            if (result.length > 0) {
                obj.publish = true
                await this.repo.update({ _id: result[0]._id }, obj)
            } else {
                await this.repo.save(obj)
            }

        }

        fs.unlinkSync(`./public/files/${fileName}`)
        return {
            statusCode: 200,
            message: "success"
        }
    }

    async getAllScoresByClassId(email: string, class_id: string) {
        const res: any[] = []
        let obj: any;
        let result: any
        const hasStudent = (await this.classService.find(class_id))[0].studentList
        if (hasStudent.length == 0) {
            return {
                statusCode: 404,
                message: "No Records."
            }
        }

        //check if member
        const stdList = (await this.studentListService.getStudentListByClassId(class_id))[0].members
        const matchMember = stdList.find((e: any) => e.email === email)

        if (matchMember) {
            result = await this.repo.aggregate([
                {
                    $match: {
                        "publish": true
                    }
                },
                { $unwind: "$scores" },
                {
                    $match: {
                        $expr: {
                            $eq: ["$class", new mongoose.Types.ObjectId(class_id)]
                        }, "scores.studentId": matchMember.studentId
                    }
                }
            ]).toArray()

            //no score
            if (result.length == 0) {
                res.push({
                    _id: matchMember._id,
                    title: null,
                    total: null,
                    scores: [{
                        no: matchMember.no,
                        studentId: matchMember.studentId,
                        title: matchMember.title,
                        firstName: matchMember.firstName,
                        lastName: matchMember.lastName,
                        score: null
                    }],
                    owner: false
                })

            }
            //has score
            else {
                for (const each of result) {
                    const obj = {
                        _id: each._id,
                        title: each.title,
                        total: each.total,
                        scores: [{
                            no: matchMember.no,
                            studentId: matchMember.studentId,
                            title: matchMember.title,
                            firstName: matchMember.firstName,
                            lastName: matchMember.lastName,
                            score: each.scores.score
                        }],
                        owner: false
                    }
                    res.push(obj)
                }
            }

        }
        //owner
        else {
            result = await this.repo.aggregate([
                { $match: { "class": new mongoose.Types.ObjectId(class_id) } },
                {
                    $lookup: {
                        from: "class",
                        localField: "class",
                        foreignField: "_id",
                        as: "class"
                    }
                },
                { $unwind: "$class" },
                {
                    $lookup: {
                        from: "studentList",
                        localField: "class.studentList",
                        foreignField: "_id",
                        as: "studentList"
                    }
                },
                { $unwind: "$studentList" },
                {
                    $project: {
                        "_id": "$_id",
                        "title": "$title",
                        "total": "$total",
                        "scores": {
                            $map: {
                                "input": {
                                    $zip: { "inputs": ["$scores", "$studentList.members"] }
                                },
                                "as": "el",
                                "in": {
                                    "scores": { $arrayElemAt: ["$$el", 0] },
                                    "studentList": { $arrayElemAt: ["$$el", 1] }
                                }
                            }
                        }
                    }
                },
                { $unwind: "$scores" }
            ]).toArray()

            if (result.length == 0 && hasStudent.length !== 0) {
                result = await this.classService.getStudentListByClassId(class_id);

                if (result.length == 0) {
                    return {
                        statusCode: 404,
                        message: "No Records."
                    }
                }
                obj = {
                    _id: result[0]._id,
                    title: null,
                    total: null,
                    scores: [],
                    owner: true
                }

                for (const each of result[0].studentList.members) {
                    obj.scores.push({
                        no: each.no,
                        studentId: each.studentId,
                        title: each.title,
                        firstName: each.firstName,
                        lastName: each.lastName,
                        score: null
                    })
                }

                res.push(obj)

            } else {
                const scoreList = result.reduce((r: any, a: any) => {
                    r[a.title] = [...r[a.title] || [], a]
                    return r
                }, {})

                for (const key in scoreList) {
                    obj = {
                        _id: scoreList[key][0]._id,
                        title: key,
                        total: scoreList[key][0].total,
                        scores: [],
                        owner: true
                    }

                    for (const each of scoreList[key]) {

                        obj.scores.push({
                            no: each.scores.studentList.no,
                            studentId: each.scores.studentList.studentId,
                            title: each.scores.studentList.title,
                            firstName: each.scores.studentList.firstName,
                            lastName: each.scores.studentList.lastName,
                            score: each.scores.scores.score
                        })

                    }
                    res.push(obj)
                }

            }
        }

        return {
            statusCode: 200,
            message: "success",
            data: {
                total: result.length === 0 ? 0 : res.length,
                results: res
            }
        }

    }

    async getScoresByClassScoreTitle(class_id: string, scoreTitle: string) {
        return await this.repo.aggregate([
            { $match: { "class": new mongoose.Types.ObjectId(class_id), "title": scoreTitle } },
            {
                $lookup: {
                    from: "class",
                    localField: "class",
                    foreignField: "_id",
                    as: "class"
                }
            },
            { $unwind: "$class" },
            {
                $lookup: {
                    from: "subject",
                    localField: "class.subject",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            { $unwind: "$subject" },
            {
                $lookup: {
                    from: "studentList",
                    localField: "class.studentList",
                    foreignField: "_id",
                    as: "studentList"
                }
            },
            { $unwind: "$studentList" },
            {
                $project: {
                    "_id": "$_id",
                    "title": "$title",
                    "total": "$total",
                    "class": "$class",
                    "subject": "$subject",
                    "scores": {
                        $map: {
                            "input": {
                                $zip: { "inputs": ["$scores", "$studentList.members"] }
                            },
                            "as": "el",
                            "in": {
                                "scores": { $arrayElemAt: ["$$el", 0] },
                                "studentList": { $arrayElemAt: ["$$el", 1] }
                            }
                        }
                    }
                }
            },
            { $unwind: "$scores" }
        ]).toArray()
    }

    async changeToAnnounced(score_id: string) {
        await this.repo.update({ "_id": score_id }, { announce: true })
    }

    async getScoresToPublishAnnounceByClass(userId: string, class_id: string, publ: boolean) {
        const cls = (await this.classService.find(class_id))[0]
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

        const res: any[] = []
        const result = await this.repo.aggregate([
            { $match: { "class": new mongoose.Types.ObjectId(class_id), "announce": false, "publish": !publ } },
            {
                $project: {
                    "_id": "$_id",
                    "title": "$title",
                    "announce": "$announce",
                    "publish": "$publish"
                }
            }
        ]).toArray()

        if (result.length == 0) {
            return {
                statusCode: 404,
                message: "No Records."
            }
        }

        for (const each of result) {
            const obj = {
                id: each._id,
                title: each.title,
                announce: each.announce,
                publish: each.publish
            }

            res.push(obj)
        }

        return {
            statusCode: 200,
            message: "success",
            data: {
                total: res.length,
                results: res
            }

        }
    }

    async getScoreTemplate(userId: string, class_id: string) {
        const cls = (await this.classService.find(class_id))[0]
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

        const result = await this.classService.getStudentListByClassId(class_id)
        const workbook = new ExcelJS.Workbook()

        workbook.creator = 'Helio Score System'
        workbook.created = new Date()

        const sheetName = (result[0].studentList.groupName).replace(/[&\/\\#,+()$~%.'":*?<>{}]| /g, '-')
        const sheet = workbook.addWorksheet(sheetName)
        const studentList: any[] = []

        for (const each of result[0].studentList.members) {
            const obj = {
                'เลขที่': each.no,
                'รหัสนักเรียน': each.studentId,
                'คำนำหน้า': each.title,
                'ชื่อ': each.firstName,
                'นามสกุล': each.lastName
            }
            studentList.push(obj)
        }

        const rows: any[] = []
        studentList.forEach((each) => {
            rows.push(Object.values(each))
        })
        rows.push(['คะแนนเต็ม'])

        rows.unshift(Object.keys(studentList[0]))

        sheet.addRows(rows)

        for (let i = 6; i < 23; i++) {
            sheet.getColumn(i).protection = {
                locked: false
            }
        }

        await sheet.protect('', {
            selectLockedCells: false,
            selectUnlockedCells: true,
            formatColumns: true

        })

        const File = await new Promise((resolve, reject) => {
            tmp.file({
                discardDescriptor: true,
                postfix: '.xlsx',
                mode: parseInt('0600', 8)
            },
                async (err) => {
                    if (err) {
                        throw new BadRequestException(err)
                    }
                    const fileName = encodeURI(`helio-${sheetName}.xlsx`)
                    workbook.xlsx.writeFile(fileName).then(_ => {
                        resolve(fileName)
                    })
                }
            )
        })
        return File
    }

    async editScoreByScoreIdStdId(userId: string, data: EditScoreDto) {
        const sc = await this.findOne(data.scoreId)
        if (!sc) {
            return {
                statusCode: 400,
                message: "Score id is required."
            }
        }
        const cls = await this.classService.find(sc.class.toString())
        if (!cls) {
            return {
                statusCode: 404,
                message: "Class Not Found."
            }
        }
        const subj = (await this.subjectService.find(cls[0].subject.toString()))[0]
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


        for (const each of data.std) {
            await this.repo.findOneAndUpdate({
                $and: [
                    { _id: new mongoose.Types.ObjectId(data.scoreId) },
                    { "scores.studentId": each.studentId }
                ]
            },
                { $set: { "scores.$.score": each.score } })
        }

        return {
            statusCode: 200,
            message: "success"
        }

    }

    async deleteScoreByScoreId(scoreId: string, userId?: string) {
        if (userId) {
            const score = await this.findOne(scoreId)
            if (!score) {
                return {
                    statusCode: 404,
                    message: "Score Not Found."
                }
            }
            const cls = (await this.classService.find(score.class.toString()))[0]
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

        }
        await this.repo.deleteOne({ _id: new mongoose.Types.ObjectId(scoreId) })
        return {
            statusCode: 200,
            message: "success"
        }
    }

    async find(classId: string) {
        try {
            return await this.repo.findBy({ where: { class: new mongoose.Types.ObjectId(classId) } })
        } catch (err: any) {
            throw {
                statusCode: err.statuscode,
                message: err.originalError
            }
        }
    }

    async findOne(scoreId: string) {
        return (await this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(scoreId) } }))[0]
    }

    async publishScoreByScoreId(userId: string, body: PublishScoreDto) {
        const score = await this.findOne(body.score_id)
        if (!score) {
            return {
                statusCode: 404,
                message: "Score Not Found."
            }
        }

        const cls = (await this.classService.find(score.class))[0]
        if (!cls) {
            return {
                statusCode: 404,
                message: "Class Not Found."
            }
        }

        const subj = (await this.subjectService.find(cls.subject))[0]
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

        score.publish = true
        await this.repo.save(score)
        let res;
        if (body.announce) {
            res = await this.mailService.announceByClassIdScoreTitle(userId, cls._id.toString(), score.title)
        }

        return res
    }

    async findByClassOnlyPublished(classId: string) {
        try {
            return await this.repo.findBy({ where: { class: new mongoose.Types.ObjectId(classId), publish: true } })
        } catch (err: any) {
            throw {
                statusCode: err.statuscode,
                message: err.originalError
            }
        }
    }
}
