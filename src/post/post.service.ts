import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { UploadApiResponse } from "cloudinary"
import mongoose, { Model } from "mongoose"
import { CommentService } from "../comment/comment.service"
import { checkObjectIdValidity } from "../utils/checkObjectIdValidity"
import { uploadStream } from "../utils/uploadStream"
import { createPostDto } from "./dto/create-post.dto"
import { Post, PostDocument } from "./schema/post.schema"

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        private readonly commentService: CommentService
    ) {}
    async getAllPosts(): Promise<Post[]> {
        return await this.postModel.find()
    }

    async createPost(createPostDto: createPostDto): Promise<Post> {
        const { content, postOwnerId } = createPostDto
        const id = new mongoose.Types.ObjectId()
        let urls = []
        const res = await uploadStream(
            `users/${postOwnerId}/posts/${id}`,
            content
        )

        res.forEach((item: UploadApiResponse) => urls.push(item.secure_url))

        return await new this.postModel({
            ...createPostDto,
            _id: id,
            postOwnerId,
            content: urls,
        }).save()
    }

    async getPostById(postId: string): Promise<Post> {
        return await this.postModel.findById(postId)
    }

    async getUserPosts(userId: string): Promise<Post[]> {
        checkObjectIdValidity([userId])
        return await this.postModel.find({ postOwnerId: { $eq: userId } })
    }

    async deletePost(postId: string, userId: string): Promise<Post> {
        checkObjectIdValidity([postId, userId])
        const post = await this.postModel.findOne({
            _id: { $eq: postId },
            postOwnerId: { $eq: userId },
        })

        // convert objectId to String
        if (post) {
            await this.commentService.deleteAllPostComments(postId)
            return await post.remove()
        } else {
            throw new HttpException(
                "You are not authorized to delete this post or it does not exist",
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async likePost(postId: string, reqUserId: string): Promise<Post> {
        const post = await this.postModel.findById(postId)

        if (post) {
            const isLiked = await this.postModel.findOne({
                _id: { $eq: postId },
                $elemMatch: { "like.users": { $eq: reqUserId } },
            })

            if (isLiked) {
                throw new HttpException(
                    "You have already liked this post",
                    HttpStatus.BAD_REQUEST
                )
            }
            return await this.postModel.findByIdAndUpdate(
                postId,
                {
                    $inc: { "like.total": 1 },
                    $push: { "like.users": reqUserId },
                },
                { new: true }
            )
        } else {
            throw new HttpException("Post does not exist", HttpStatus.NOT_FOUND)
        }
    }

    async unlikePost(postId: string, reqUserId: string): Promise<Post> {
        const post = await this.postModel.findById(postId)

        if (post) {
            const isLiked = await this.postModel.findOne({
                _id: { $eq: postId },
                $elemMatch: { "like.users": { $eq: reqUserId } },
            })
            if (!isLiked) {
                throw new HttpException(
                    "You have already unliked this post",
                    HttpStatus.BAD_REQUEST
                )
            }
            return this.postModel.findByIdAndUpdate(
                postId,
                {
                    $inc: { "like.total": -1 },
                    $pull: { "like.users": reqUserId },
                },
                { new: true }
            )
        } else {
            throw new HttpException("Post does not exist", HttpStatus.NOT_FOUND)
        }
    }
    async deleteAllUserPosts(userId: string): Promise<string> {
        checkObjectIdValidity([userId])
        try {
            await this.postModel.deleteMany({ postOwnerId: { $eq: userId } })
            await this.commentService.deleteAllUserComments(userId)
            return "success"
        } catch (error) {
            throw new HttpException(
                "Something went wrong",
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    // async updatePost(id: string, updatePostDto: updatePostDto): Promise<Post> {
    //     const { reqUserId, content } = updatePostDto
    //     const post = await this.postModel.findById(id)
    //     if (post.postOwnerId === reqUserId) {
    //         return this.postModel.findByIdAndUpdate(
    //             id,
    //             { content },
    //             { new: true }
    //         )
    //     } else {
    //         throw new HttpException(
    //             'You are not authorized to change this post',
    //             HttpStatus.UNAUTHORIZED
    //         )
    //     }
    // }
}
