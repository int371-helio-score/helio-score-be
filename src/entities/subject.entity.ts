import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('subject')
export class Subject {
    @ObjectIdColumn()
    _id: string

    @Column()
    subjectCode: string

    @Column()
    subjectName: string

    @Column()
    owner: Object

    @Column()
    semester: string

    @Column()
    grade: string
}
