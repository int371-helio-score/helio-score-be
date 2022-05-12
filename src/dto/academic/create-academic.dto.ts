import { IsString } from "class-validator";

export class CreateAcademicDto { }

export class getAcademicByOwnerDto {
    @IsString()
    ownerId: string
}