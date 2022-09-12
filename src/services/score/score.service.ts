import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class ScoreService {
    constructor(
        @InjectRepository(Score)
        private repo: MongoRepository<Score>
    ) { }

    @Inject()
    studentListService: StudentListService
    @Inject()
    classService: ClassService
    @Inject()
    subjectService: SubjectService

    async importScore(req: any) {
        const classId = req.class_id
        const fileName = getFileName()

        if (fileName === "") {
            throw new BadRequestException('File is required.')
        }

        try {
            const source = fs.readFileSync(`./public/files/${fileName}`, 'utf-8')

            const data: any[] = []
            const lines = source.split('\n')
            for (const line of lines) {
                if (line.length > 0) {
                    const fields = line.split(',')
                    data.push(fields)
                }
            }

            let obj: { [k: string]: any }
            const lastRow = data.length - 1
            //column
            for (let i = 4; i < data[0].length; i++) {
                obj = {
                    title: data[0][i].replace("\r", ''),
                    total: data[lastRow][i].replace("\r", ''),
                    class: new mongoose.Types.ObjectId(classId),
                    scores: [],
                    announce: false
                }

                //row
                for (let j = 1; j < lastRow; j++) {
                    const stdScore = {
                        studentId: data[j][1].replace("\r", ''),
                        score: data[j][i].replace("\r", '')
                    }
                    obj.scores.push(stdScore)
                }

                const result = await this.repo.find({
                    where: {
                        "title": obj.title,
                        "class": obj.class
                    }
                })

                if (result.length > 0) {
                    await this.repo.update({ "_id": result[0]._id }, obj)
                } else {
                    await this.repo.save(obj)
                }

            }

            fs.rmSync(`./public/files/${fileName}`)

            return {
                statusCode: 200,
                message: "success"
            }

        } catch (err: any) {
            return {
                statusCode: err.statuscode,
                message: err.originalError
            }
        }
    }

    async getAllScoresByClassId(class_id: string) {
        const res: any[] = []
        let obj: any;
        const hasStudent = (await this.classService.find(class_id))[0].studentList
        if (hasStudent.length == 0) {
            return {
                statusCode: 404,
                message: "No Records."
            }
        }
        let result = await this.repo.aggregate([
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
                scores: []
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
                    scores: []
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
                    "score_id": "$_id",
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

    async getScoresToAnnounceByClass(class_id: string) {
        const res: any[] = []
        const result = await this.repo.aggregate([
            { $match: { "class": new mongoose.Types.ObjectId(class_id), "announce": false } },
            {
                $project: {
                    "_id": "$_id",
                    "title": "$title",
                    "announce": "$announce"
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
                announce: each.announce
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

    async getScoreTemplate(class_id: string) {
        const result = await this.classService.getStudentListByClassId(class_id)
        // const subject = {
        //     subjectName: result[0].subjectName,
        //     grade: result[0].grade,
        //     room: result[0].room,
        //     semester: result[0].semester,
        //     // academicYear: sub[0].academicYear
        // }


        const workbook = new ExcelJS.Workbook()

        workbook.creator = 'Helio Score System'
        workbook.created = new Date()

        const sheet = workbook.addWorksheet(`${result[0].studentList.groupName}`)

        const studentList: any[] = []

        for (const each of result[0].studentList.members) {
            const obj = {
                'เลขที่': each.no,
                'รหัสประจำตัวนักเรียน': each.studentId,
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
                    const fileName = `helio-${result[0].studentList.groupName}.xlsx`
                    workbook.xlsx.writeFile(fileName).then(_ => {
                        resolve(fileName)
                    })
                }
            )
        })
        return File
    }
}
