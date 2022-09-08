import { PartialType } from "@nestjs/mapped-types"
import { Allow, IsEmail, IsString } from "class-validator"
import { createUserDto } from "./create-user.dto"

export class updateUserDto extends PartialType(createUserDto) {
    @IsEmail()
    @IsString()
    email?: string

    @IsString()
    bio?: string

    @IsString()
    username?: string

    @Allow()
    @IsString()
    reqUserId: string
}
