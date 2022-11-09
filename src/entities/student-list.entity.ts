import { CreateStudentListDto } from "src/dto/student-list/create-student-list.dto";
import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity('studentList')
export class StudentList {
    @ObjectIdColumn()
    _id: string

    @Column()
    groupName: string

    @Column()
    owner: Object

    @Column()
    members: CreateStudentListDto[]

    @Column()
    status: Boolean
}
