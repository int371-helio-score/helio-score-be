import { Column, Entity, ObjectIdColumn } from "typeorm";
import { Account } from "./account.entity";

@Entity('group')
export class Group {
    @ObjectIdColumn()
    _id: string

    @Column()
    groupName: string

    @Column()
    owner_id: Account
}
