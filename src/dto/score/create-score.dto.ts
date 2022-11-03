import { IsBoolean, IsString } from "class-validator";

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
    scoreId: string

    std: stdScore[]
}

export class DeleteScoreDto {
    @IsString()
    score_id: string
}

export class PublishScoreDto {
    @IsString()
    score_id: string

    @IsBoolean()
    announce: Boolean
}