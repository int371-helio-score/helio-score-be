import { Column, Entity, ObjectIdColumn } from "typeorm";
import { lov } from "./lov.entities";

@Entity('class')
export class Class {
    @ObjectIdColumn()
    _id: string

    @Column()
    grade: lov

    @Column()
    room: lov

    @Column()
    member: Object[]
}
