import { IsString } from "class-validator";

export class CreateScoreDto { }

export class getScoreDto {
    @IsString()
    class_id: string
}

export class getScoreByClassScoreTitle {
    @IsString()
    class_id: string

    @IsString()
    scoreTitle: string
}