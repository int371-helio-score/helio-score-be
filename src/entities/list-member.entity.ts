import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('listmember')
export class ListMember {
    @ObjectIdColumn()
    _id: string

    @Column()
    no: number

    @Column()
    studentId: number

    @Column()
    title: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    email: string

    @ObjectIdColumn()
    group_id: string
}
