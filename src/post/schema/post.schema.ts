import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { Comment } from 'src/comment/schema/comment.schema'

export type PostDocument = Post & Document

@Schema({ _id: false })
class Like {
    @Prop({ default: 0 })
    total: number
    @Prop({ default: [] })
    users: string[]
}

@Schema()
export class Post {
    // IDK why findById is not working
    // @Prop({ default: () => new mongoose.Types.ObjectId() })
    // _id: mongoose.Types.ObjectId
    @Prop({ required: true, default: [] })
    content: string[]
    @Prop({ required: true })
    postOwnerId: string
    @Prop({ type: Like, default: () => ({}) })
    like: Like
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    })
    comments: Comment[]
}

export const PostSchema = SchemaFactory.createForClass(Post)
