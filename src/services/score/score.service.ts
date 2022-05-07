import { Injectable } from '@nestjs/common';
import { getFileName } from '../common/common.service';
import * as fs from 'fs'
import { InjectRepository } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';
import { Repository } from 'typeorm';
import mongoose from 'mongoose';

@Injectable()
export class ScoreService {
    constructor(
        @InjectRepository(Score)
        private repo: Repository<Score>
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
}
