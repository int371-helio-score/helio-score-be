import { IsArray, IsString } from "class-validator"

export class CreateSubjectDto {
    @IsString()
    academicYear: string

    @IsString()
    semester: string

    @IsString()
    grade: string

    @IsString()
    subjectCode: string

    @IsString()
    subjectName: string

    @IsArray()
    @IsString({ each: true })
    class: string[]
}

export class getSubjectsByAcademicSemesterDto {
    @IsString()
    academicYear: string

    @IsString()
    semester: string
}

export class EditSubjectDto {
    @IsString()
    subjectId: string

    @IsString()
    subjectCode: string

    @IsString()
    subjectName: string

    @IsString()
    grade: string

    @IsString()
    academicYear: string

    @IsString()
    semester: string
}