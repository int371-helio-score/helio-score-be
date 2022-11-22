import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateClassDto {
    @IsString()
    @IsNotEmpty()
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
    @IsNotEmpty()
    classId: string

    @IsString()
    @IsNotEmpty()
    room: string
}