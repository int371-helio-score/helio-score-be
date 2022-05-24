import { IsString } from "class-validator"

export class CreateSubjectDto { }

export class getSubjectsByAcademicSemesterDto {
    @IsString()
    academicYear: string

    @IsString()
    semester: string
}