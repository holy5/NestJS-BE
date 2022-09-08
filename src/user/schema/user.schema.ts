import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document } from "mongoose"
import { Post } from "src/post/schema/post.schema"
import * as bcrypt from "bcryptjs"

export type UserDocument = User & Document

@Schema({ _id: false })
class Follow {
    @Prop({ default: 0 })
    total: number
    @Prop({ default: [] })
    users: string[]
}

@Schema()
export class User {
    // IDK why findById is not working
    // @Prop({
    //     type: mongoose.Types.ObjectId,
    //     default: () => new mongoose.Types.ObjectId(),
    // })
    // _id: mongoose.Types.ObjectId
    @Prop({ required: true, unique: true })
    username: string
    @Prop()
    bio: string
    @Prop()
    totalPosts: number
    @Prop({ type: Follow, default: () => ({}) })
    followers: Follow
    @Prop({ type: Follow, default: () => ({}) })
    followings: Follow
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Post" })
    posts: Post[]
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Post" })
    savedPosts: Post[]
    @Prop({ required: true, unique: true })
    email: string
    @Prop({ required: true })
    password: string
    @Prop({ default: "" })
    avatar: string
    @Prop({ required: true })
    privacy: "public" | "private"
    @Prop({ required: true })
    role: "user" | "admin"
}

export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
) {
    return await bcrypt.compare(candidatePassword, this.password)
}

// UserSchema.pre('deleteOne', function (next) {
//     const userId = this._id
//     mongoose.model('Post').remove({ postOwnerId: { $eq: userId } }, next)
//     // mongoose.model('Comment').deleteMany({ commentOwnerId: userId })
//     // mongoose.model('Reply').deleteMany({ replyOwnerId: userId })
// })
