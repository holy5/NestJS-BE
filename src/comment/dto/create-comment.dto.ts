import { Allow, IsNotEmpty, IsString } from 'class-validator'

export class createCommentDto {
    @IsNotEmpty()
    content: string
    @IsString()
    @IsNotEmpty()
    postId: string
    @Allow()
    commentOwnerId?: string
}
