import { forwardRef, Module } from '@nestjs/common'
import { CommentService } from './comment.service'
import { CommentController } from './comment.controller'

import { MongooseModule } from '@nestjs/mongoose'
import { Comment, CommentSchema } from './schema/comment.schema'
import { ReplyModule } from 'src/reply/reply.module'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
        ]),
        forwardRef(() => ReplyModule),
    ],
    controllers: [CommentController],
    providers: [CommentService],
    exports: [CommentService],
})
export class CommentModule {}

