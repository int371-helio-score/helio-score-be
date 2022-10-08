import { IsArray, IsString } from "class-validator";

export class CreateClassDto {
    @IsString()
    subjectId: string

    @IsArray()
    @IsString({ each: true })
    class: string[]
}

export class GetAllClassBySubjectDto {
    @IsString()
    subject_id: string
}