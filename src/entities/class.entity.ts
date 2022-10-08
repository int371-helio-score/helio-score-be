import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('class')
export class Class {
    @ObjectIdColumn()
    _id: string

    @Column()
    subject: string

    @Column()
    grade: string

    @Column()
    room: string

    @Column()
    studentList: Object[]

}
