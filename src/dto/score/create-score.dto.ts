import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateScoreDto {
    studentId: number
    score: number
}

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

export class importScoreDto {
    @IsString()
    class_id: string

    file: any
}

class stdScore {
    studentId: number

    score: number
}

export class EditScoreDto {
    @IsNotEmpty()
    scoreId: string

    std: stdScore[]
}

export class DeleteScoreDto {
    @IsString()
    @IsNotEmpty()
    score_id: string
}

export class PublishScoreDto {
    @IsString()
    @IsNotEmpty()
    score_id: string

    @IsBoolean()
    @IsNotEmpty()
    announce: Boolean
}