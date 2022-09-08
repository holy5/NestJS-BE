import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CommentService } from "../comment/comment.service"
import { IQuery } from "../interface/query.interface"

import { checkObjectIdValidity } from "../utils/checkObjectIdValidity"
import { CreateReplyDto } from "./dto/create-reply.dto"
import { UpdateReplyDto } from "./dto/update-reply.dto"
import { Reply, ReplyDocument } from "./schema/reply.schema"

@Injectable()
export class ReplyService {
    constructor(
        @InjectModel(Reply.name)
        private readonly replyModel: Model<ReplyDocument>,
        @Inject(forwardRef(() => CommentService))
        private readonly commentService: CommentService
    ) {}

    async createReply(createReplyDto: CreateReplyDto): Promise<Reply> {
        const { commentId } = createReplyDto

        const reply = await new this.replyModel(createReplyDto).save()
        await this.commentService.updateReplies(commentId, reply)
        return reply
    }

    async getAllReplies(): Promise<Reply[]> {
        return await this.replyModel.find()
    }

    async getCommentReplies(
        commentId: string,
        query: IQuery
    ): Promise<Reply[]> {
        const { limit } = query
        checkObjectIdValidity([commentId])
        return await this.replyModel
            .find({
                commentId: { $eq: commentId },
            })
            .limit(limit)
    }

    async updateReply(replyId: string, updateReplyDto: UpdateReplyDto) {
        checkObjectIdValidity([replyId])
        const { content, reqUserId } = updateReplyDto
        const reply = await this.replyModel.findOne({
            _id: replyId,
            replyOwnerId: { $eq: reqUserId },
        })
        if (reply) {
            return await this.replyModel.findByIdAndUpdate(
                replyId,
                {
                    content,
                },
                { new: true }
            )
        } else {
            throw new HttpException(
                "You are not authorized to edit this reply or it does not exist",
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async deleteReply(replyId: string, reqUserId: string): Promise<Reply> {
        checkObjectIdValidity([replyId])
        const reply = await this.replyModel.findOne({
            _id: replyId,
            replyOwnerId: { $eq: reqUserId },
        })
        if (reply) {
            return reply.remove()
        } else {
            throw new HttpException(
                "You are not authorized to delete this reply or it does not exist",
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async likeReply(replyId: string, reqUserId: string): Promise<Reply> {
        checkObjectIdValidity([replyId])
        const reply = await this.replyModel.findById(replyId)
        if (reply) {
            const isLiked = await this.replyModel.findOne({
                _id: replyId,
                $elemMatch: {
                    "like.users": { $eq: reqUserId },
                },
            })
            if (isLiked) {
                throw new HttpException(
                    "Already liked this reply",
                    HttpStatus.BAD_REQUEST
                )
            } else {
                return await this.replyModel.findByIdAndUpdate(
                    replyId,
                    {
                        $inc: { "like.total": 1 },
                        $push: { "like.users": reqUserId },
                    },
                    { new: true }
                )
            }
        } else {
            throw new HttpException("Reply not found", HttpStatus.NOT_FOUND)
        }
    }
    async unlikeReply(replyId: string, reqUserId: string): Promise<Reply> {
        checkObjectIdValidity([replyId])
        const reply = await this.replyModel.findById(replyId)
        if (reply) {
            const isLiked = await this.replyModel.findOne({
                _id: replyId,
                $elemMatch: {
                    "like.users": { $eq: reqUserId },
                },
            })
            if (!isLiked) {
                throw new HttpException(
                    "Already unliked this reply",
                    HttpStatus.BAD_REQUEST
                )
            }
            return await this.replyModel.findByIdAndUpdate(
                replyId,
                {
                    $inc: { "like.total": -1 },
                    $pull: { "like.users": reqUserId },
                },
                { new: true }
            )
        } else {
            throw new HttpException("Reply not found", HttpStatus.NOT_FOUND)
        }
    }

    async deletePostReplies(postId: string): Promise<string> {
        checkObjectIdValidity([postId])
        try {
            await this.replyModel.deleteMany({ postId: { $eq: postId } })
            return "success"
        } catch (error) {
            throw new HttpException(
                "Something went wrong",
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    async deleteAllCommentReplies(commentId: string): Promise<string> {
        try {
            await this.replyModel.deleteMany({ commentId: { $eq: commentId } })
            return "success"
        } catch (error) {
            throw new HttpException(
                "Something went wrong",
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
