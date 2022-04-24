import { Column, Entity, ObjectIdColumn } from "typeorm"

@Entity('school')
export class School {
    @ObjectIdColumn()
    _id: string

    @Column()
    schoolId: number

    @Column()
    schoolName: string

    // @Column()
    // province: string

    // @Column()
    // city: string
}
