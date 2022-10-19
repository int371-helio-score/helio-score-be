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

export class EditClassDto {
    @IsString()
    classId: string

    @IsString()
    room: string
}