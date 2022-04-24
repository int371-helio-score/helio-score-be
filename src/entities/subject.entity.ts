import { Column, Entity, ObjectIdColumn } from "typeorm";
import { Account } from "./account.entity";
import { Class } from "./class.entity";
import { lov } from "./lov.entities";

@Entity('subject')
export class Subject {
    @ObjectIdColumn()
    _id: string

    @Column()
    subjectId: string

    @Column()
    subjectName: string

    @Column()
    owner_id: Account

    @Column()
    semester: lov

    @Column()
    class_id: Class[]
}
