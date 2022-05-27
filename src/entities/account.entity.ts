import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('account')
export class Account {
    @ObjectIdColumn()
    _id: string

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    schoolId: number

    @Column()
    googleId: string

    @Column()
    verify: Boolean
}
