import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { IQuery } from "../interface/query.interface"
import { ReplyService } from "../reply/reply.service"
import { Reply } from "../reply/schema/reply.schema"
import { checkObjectIdValidity } from "../utils/checkObjectIdValidity"
import { createCommentDto } from "./dto/create-comment.dto"
import { updateCommentDto } from "./dto/update-comment.dto"
import { Comment, CommentDocument } from "./schema/comment.schema"

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name)
        private readonly commentModel: Model<CommentDocument>,
        @Inject(forwardRef(() => ReplyService))
        private readonly replyService: ReplyService
    ) {}

    async getAllComments(): Promise<Comment[]> {
        return await this.commentModel.find().populate("replies")
    }

    async getCommentById(id: string): Promise<Comment> {
        return this.commentModel.findById(id)
    }

    async getPostComments(postId: string, query: IQuery): Promise<Comment[]> {
        checkObjectIdValidity([postId])
        const { limit } = query
        return await this.commentModel.find({ postId }).limit(limit)
    }

    async createComment(createCommentDto: createCommentDto): Promise<Comment> {
        return await new this.commentModel(createCommentDto).save()
    }

    async deleteComment(
        commentId: string,
        reqUserId: string
    ): Promise<Comment> {
        checkObjectIdValidity([commentId])
        const comment = await this.commentModel.findOne({
            _id: commentId,
            commentOwnerId: { $eq: reqUserId },
        })
        if (comment) {
            await this.replyService.deleteAllCommentReplies(commentId)
            return await this.commentModel.findByIdAndDelete(commentId)
        } else {
            throw new HttpException(
                "You are not authorized to delete this comment or it does not exist",
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async updateComment(
        commentId: string,
        updateCommentDto: updateCommentDto
    ): Promise<Comment> {
        checkObjectIdValidity([commentId])
        const { content, reqUserId } = updateCommentDto
        const comment = await this.commentModel.findOne({
            _id: commentId,
            commentOwnerId: { $eq: reqUserId },
        })
        if (comment) {
            return await this.commentModel.findByIdAndUpdate(
                commentId,
                {
                    content,
                },
                { new: true }
            )
        } else {
            throw new HttpException("Comment not found", HttpStatus.NOT_FOUND)
        }
    }

    async updateReplies(commentId: string, reply: Reply): Promise<Comment> {
        const comment = await this.commentModel.findById(commentId)
        if (!comment) {
            throw new HttpException("Comment not found", HttpStatus.NOT_FOUND)
        }
        return await this.commentModel.findByIdAndUpdate(
            commentId,
            {
                $push: { replies: reply },
            },
            {
                new: true,
            }
        )
    }

    async likeComment(commentId: string, reqUserId: string): Promise<Comment> {
        checkObjectIdValidity([commentId])
        const comment = await this.commentModel.findById(commentId)

        if (comment) {
            const isLiked = await this.commentModel.findOne({
                _id: commentId,
                $elemMatch: { "like.users": { $eq: reqUserId } },
            })

            if (isLiked) {
                throw new HttpException(
                    "Already liked this comment",
                    HttpStatus.BAD_REQUEST
                )
            }
            return await this.commentModel.findByIdAndUpdate(
                commentId,
                {
                    $inc: { "like.total": 1 },
                    $push: { "like.users": reqUserId },
                },
                {
                    new: true,
                }
            )
        } else {
            throw new HttpException("Comment not found", HttpStatus.NOT_FOUND)
        }
    }

    async unlikeComment(
        commentId: string,
        reqUserId: string
    ): Promise<Comment> {
        const comment = await this.commentModel.findById(commentId)
        if (comment) {
            const isLiked = await this.commentModel.findOne({
                _id: commentId,
                $elemMatch: { "like.users": { $eq: reqUserId } },
            })

            if (!isLiked) {
                throw new HttpException(
                    "You already unliked this comment",
                    HttpStatus.BAD_REQUEST
                )
            }
            return await this.commentModel.findByIdAndUpdate(
                commentId,
                {
                    $inc: { "like.total": -1 },
                    $pull: { "like.users": reqUserId },
                },
                {
                    new: true,
                }
            )
        } else {
            throw new HttpException("Comment not found", HttpStatus.NOT_FOUND)
        }
    }
    async deleteAllUserComments(userId: string): Promise<string> {
        checkObjectIdValidity([userId])
        try {
            await this.commentModel.deleteMany({ postOwnerId: { $eq: userId } })
            return "success"
        } catch (error) {
            throw new HttpException(
                "Something went wrong",
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
    async deleteAllPostComments(postId: string): Promise<string> {
        try {
            checkObjectIdValidity([postId])
            await this.commentModel.deleteMany({ postId: { $eq: postId } })
            return "success"
        } catch (error) {
            throw new HttpException(
                "Something went wrong",
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
