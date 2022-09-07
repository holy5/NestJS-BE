import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsString } from 'class-validator'
import { createCommentDto } from './create-comment.dto'

export class updateCommentDto extends PartialType(createCommentDto) {
    @IsNotEmpty()
    @IsString()
    reqUserId: string
}
