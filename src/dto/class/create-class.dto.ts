import { IsString } from "class-validator";

export class CreateClassDto { }

export class GetAllClassBySubjectDto {
    @IsString()
    subject_id: string
}