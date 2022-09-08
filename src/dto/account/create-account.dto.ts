import { IsEmail, IsNumber, IsString, Matches, MaxLength, MinLength } from "class-validator"

export class CreateAccountDto {
    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsEmail()
    email: string

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    password: string

    @IsNumber()
    schoolId: number
}

export class EditAccountDto {
    @IsString()
    firstName: string

    @IsString()
    lastName: string
}

export class GoogleDto {
    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsEmail()
    email: string

    @IsString()
    googleId: string

    @IsString()
    image: string

}