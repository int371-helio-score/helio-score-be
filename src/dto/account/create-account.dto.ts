import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches, MaxLength, MinLength } from "class-validator"

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    password: string

    @IsNumber()
    @IsNotEmpty()
    schoolId: number
}

export class EditAccountDto {
    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
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
export class ForgotPasswordDto {
    @IsEmail()
    email: string
}

export class EditSchool {
    @IsNumber()
    schoolId: number
}

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    currentPassword: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    newPassword: string
}