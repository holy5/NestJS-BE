import { Allow, IsEmail, IsNotEmpty, IsString } from "class-validator"

export class createUserDto {
    @IsNotEmpty()
    @IsString()
    username: string

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string

    @Allow()
    role?: string

    @Allow()
    privacy?: "public" | "private"

    @Allow()
    avatar?: Express.Multer.File | undefined
}
