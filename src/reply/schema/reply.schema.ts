import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document, ObjectId } from 'mongoose'

export type ReplyDocument = Reply & Document

@Schema({ _id: false })
class Like {
    @Prop({ default: 0 })
    total: number
    @Prop({ default: [] })
    users: string[]
}

@Schema({ timestamps: true })
export class Reply {
    @Prop({ required: true })
    postId: string
    @Prop()
    commentId: string
    @Prop({ required: true })
    content: string
    // @Prop({ required: true })
    // commentOwnerId: string
    @Prop({ required: true })
    replyOwnerId: string
    @Prop({ type: Like, default: () => ({}) })
    like: Like
    // @Prop()
    // createdAt: Date
    // @Prop()
    // updatedAt: Date
}

export const ReplySchema = SchemaFactory.createForClass(Reply)

