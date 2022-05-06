import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('score')
export class Score {
    @ObjectIdColumn()
    _id: string

    @Column()
    title: string

    @Column()
    score: number

    @Column()
    studentId: number

    @ObjectIdColumn()
    class: string
}
