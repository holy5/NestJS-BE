import { forwardRef, Module } from '@nestjs/common'
import { ReplyService } from './reply.service'
import { ReplyController } from './reply.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Reply, ReplySchema } from './schema/reply.schema'
import { CommentModule } from 'src/comment/comment.module'
import { CommentService } from 'src/comment/comment.service'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Reply.name, schema: ReplySchema }]),
        forwardRef(() => CommentModule),
    ],
    controllers: [ReplyController],
    providers: [ReplyService],
    exports: [ReplyService],
})
export class ReplyModule {}

