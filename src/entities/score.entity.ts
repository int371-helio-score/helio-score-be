import { CreateScoreDto } from "src/dto/score/create-score.dto";
import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('score')
export class Score {
    @ObjectIdColumn()
    _id: string

    @Column()
    title: string

    @Column()
    total: number

    @Column()
    class: string

    @Column()
    scores: CreateScoreDto[]

    @Column()
    announce: Boolean

    @Column()
    publish: Boolean
}
