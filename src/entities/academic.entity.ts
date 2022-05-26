import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('academic')
export class Academic {
    @ObjectIdColumn()
    _id: string

    @Column()
    academicYear: number

    @Column()
    subject: Object[]
}
