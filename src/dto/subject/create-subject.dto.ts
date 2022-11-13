import { IsArray, IsNotEmpty, IsString } from "class-validator"

export class CreateSubjectDto {
    @IsString()
    @IsNotEmpty()
    academicYear: string

    @IsString()
    @IsNotEmpty()
    semester: string

    @IsString()
    @IsNotEmpty()
    grade: string

    @IsString()
    @IsNotEmpty()
    subjectCode: string

    @IsString()
    @IsNotEmpty()
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
    @IsNotEmpty()
    subjectId: string

    @IsString()
    @IsNotEmpty()
    subjectCode: string

    @IsString()
    @IsNotEmpty()
    subjectName: string

    @IsString()
    @IsNotEmpty()
    grade: string

    @IsString()
    @IsNotEmpty()
    academicYear: string

    @IsString()
    @IsNotEmpty()
    semester: string
}