import { PartialType } from "@nestjs/mapped-types"
import { Allow, IsString } from "class-validator"
import { createPostDto } from "./create-post.dto"

export class updatePostDto extends PartialType(createPostDto) {
    @Allow()
    @IsString()
    reqUserId: string
}
