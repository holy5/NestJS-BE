import { Allow, IsNotEmpty, IsString } from 'class-validator'

export class CreateReplyDto {
    @IsString()
    @IsNotEmpty()
    content: string

    @Allow()
    @IsString()
    commentId: string

    @Allow()
    @IsString()
    replyOwnerId: string

    @Allow()
    @IsString()
    postId: string
}

