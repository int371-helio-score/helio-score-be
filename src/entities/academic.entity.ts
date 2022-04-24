import { Column, Entity, ObjectIdColumn } from "typeorm";
import { Subject } from "./subject.entity";

@Entity('academic')
export class Academic {
    @ObjectIdColumn()
    _id: string

    @Column()
    academicYear: number

    @Column()
    subject: Subject[]
}
