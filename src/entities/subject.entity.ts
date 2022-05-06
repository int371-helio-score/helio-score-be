import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('subject')
export class Subject {
    @ObjectIdColumn()
    _id: string

    @Column()
    subjectCode: string

    @Column()
    subjectName: string

    @ObjectIdColumn()
    owner: string

    @Column()
    semester: string
}
