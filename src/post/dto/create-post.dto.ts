import { IsNotEmpty, IsString } from "class-validator"

export class createPostDto {
    @IsNotEmpty()
    content: Express.Multer.File[]

    @IsString()
    @IsNotEmpty()
    postOwnerId: string
}
