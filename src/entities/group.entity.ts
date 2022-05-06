import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('group')
export class Group {
    @ObjectIdColumn()
    _id: string

    @Column()
    groupName: string

    @ObjectIdColumn()
    owner_id: string
}
