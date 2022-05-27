import { Column, Entity, ObjectIdColumn } from "typeorm";
import { lov } from "./lov.entities";

@Entity('class')
export class Class {
    @ObjectIdColumn()
    _id: string

    @Column()
    subject: string

    @Column()
    grade: lov

    @Column()
    room: lov

    @Column()
    studentList: Object[]
}
