import { Injectable } from '@nestjs/common';
import { getFileName } from '../common/common.service';
import * as fs from 'fs'
import { InjectRepository } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';
import { MongoRepository } from 'typeorm';
import mongoose from 'mongoose';

@Injectable()
export class ScoreService {
    constructor(
        @InjectRepository(Score)
        private repo: MongoRepository<Score>
    ) { }

    async importScore(req: any) {
        const classId = req.classId
        const fileName = getFileName()

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

                await this.repo.save(obj)

            }

            fs.rmSync(`./public/files/${fileName}`)

            return {
                statusCode: 200,
                message: "Upload Successful!"
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

        const result = await this.repo.aggregate([
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
                    localField: "class.member.studentListId",
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

        for (const each of result) {
            const obj = {
                score_id: each._id,
                title: each.title,
                scores: {
                    no: each.scores.studentList.no,
                    studentId: each.scores.studentList.studentId,
                    title: each.scores.studentList.title,
                    firstName: each.scores.studentList.firstName,
                    lastName: each.scores.studentList.lastName,
                    score: each.scores.scores.score
                }
            }
            res.push(obj)
        }

        if (result.length == 0) {
            return {
                statusCode: 404,
                message: "No Records."
            }
        }

        return {
            statusCode: 200,
            message: "success",
            data: {
                total: result.length,
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
                    localField: "class.subjectId",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            { $unwind: "$subject" },
            {
                $lookup: {
                    from: "studentList",
                    localField: "class.member.studentListId",
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
}
