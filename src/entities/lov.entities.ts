import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('lov')
export class lov {
    @ObjectIdColumn()
    _id: string

    @Column()
    lovId: number

    @Column()
    lovType: string

    @Column()
    lovName: string
}