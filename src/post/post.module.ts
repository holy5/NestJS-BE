import { forwardRef, Module } from '@nestjs/common'
import { PostService } from './post.service'
import { PostController } from './post.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Post, PostSchema } from './schema/post.schema'
import { UserModule } from 'src/user/user.module'
import { CommentModule } from 'src/comment/comment.module'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        forwardRef(() => UserModule),
        CommentModule,
    ],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}
