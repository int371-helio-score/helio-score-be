import { IsNotEmpty, IsString } from "class-validator"

export class CreateStudentListDto {
    no: number
    studentId: number
    title: string
    firstName: string
    lastName: string
    email: string
}

export class getStudentListByClassDto {
    @IsString()
    class_id: string
}

export class StudentMember {
    no: number
    studentId: number
    title: string
    firstName: string
    lastName: string
}

export class ImportStudentListDto {

    @IsString()
    @IsNotEmpty()
    classId: string

    @IsString()
    @IsNotEmpty()
    groupName: string
}

export class UpdateStudentListDto {
    @IsString()
    @IsNotEmpty()
    groupName: string
}
