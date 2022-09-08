import { PartialType } from '@nestjs/mapped-types'
import { IsString } from 'class-validator'
import { CreateReplyDto } from './create-reply.dto'

export class UpdateReplyDto extends PartialType(CreateReplyDto) {
    @IsString()
    reqUserId: string
}

