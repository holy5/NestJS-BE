import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document, ObjectId } from 'mongoose'
import { Reply, ReplySchema } from 'src/reply/schema/reply.schema'

export type CommentDocument = Comment & Document

@Schema({ _id: false })
class Like {
    @Prop({ default: 0 })
    total: number
    @Prop({ default: [] })
    users: string[]
}

@Schema({ timestamps: true })
export class Comment {
    @Prop({ required: true })
    postId: string
    @Prop({ required: true })
    commentOwnerId: string
    @Prop({ required: true })
    content: string
    @Prop({ type: Like, default: () => ({}) })
    like: Like
    // @Prop()
    // createdAt: Date
    // @Prop()
    // updatedAt: Date
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }] })
    replies: Reply[]
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
