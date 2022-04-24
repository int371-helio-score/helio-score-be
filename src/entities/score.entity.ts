import { Column, Entity, ObjectIdColumn } from "typeorm";
import { Subject } from "./subject.entity";

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

    @Column()
    subject_id: Subject
}
