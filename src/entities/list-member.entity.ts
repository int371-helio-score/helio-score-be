import { Column, Entity, ObjectIdColumn } from "typeorm";
import { Account } from "./account.entity";
import { Group } from "./group.entity";

@Entity('list-member')
export class ListMember {
    @ObjectIdColumn()
    _id: string

    @Column()
    no: number

    @Column()
    studentId: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    email: string

    @Column()
    owner_id: Account

    @Column()
    group_id: Group
}
