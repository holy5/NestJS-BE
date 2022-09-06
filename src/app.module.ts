import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModule } from './user/user.module'
import { PostModule } from './post/post.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { CommentModule } from './comment/comment.module'
import { ReplyModule } from './reply/reply.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGO_URI),
        UserModule,
        AuthModule,
        ReplyModule,
        CommentModule,
        PostModule,
    ],
})
export class AppModule {}
