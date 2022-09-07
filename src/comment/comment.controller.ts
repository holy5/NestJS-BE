import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { Roles } from "../auth/roles.decorator"
import { RolesGuard } from "../auth/roles.guard"
import { IQuery } from "../interface/query.interface"
import { IRequest } from "../interface/request.interface"
import { UpdateReplyDto } from "../reply/dto/update-reply.dto"
import { CommentService } from "./comment.service"
import { createCommentDto } from "./dto/create-comment.dto"

@Roles("user")
@Controller("comment")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class CommentController {
    constructor(private commentService: CommentService) {}

    @Roles("admin")
    @Get("all")
    async getAllComments() {
        return await this.commentService.getAllComments()
    }

    @Get("/postId/:id")
    async getPostComments(@Param("id") postId: string, @Query() query: IQuery) {
        return this.commentService.getPostComments(postId, query)
    }

    @Post()
    async createComment(
        @Req() req: IRequest,
        @Body() createCommentDto: createCommentDto
    ) {
        return await this.commentService.createComment({
            ...createCommentDto,
            commentOwnerId: req.user.userId,
        })
    }

    @Post("/like/commentId/:id")
    async likeComment(@Param("id") commentId: string, @Req() req: IRequest) {
        const userId = req.user.userId
        return await this.commentService.likeComment(commentId, userId)
    }

    @Post("/unlike/commentId/:id")
    async unlikeComment(@Param("id") commentId: string, @Req() req: IRequest) {
        const userId = req.user.userId
        return await this.commentService.unlikeComment(commentId, userId)
    }

    @Delete("/:id")
    async deleteComment(@Param("id") commentId: string, @Req() req: IRequest) {
        return await this.commentService.deleteComment(
            commentId,
            req.user.userId
        )
    }

    @Patch("/:id")
    async updateComment(
        @Param("id") id: string,
        @Req() req: IRequest,
        @Body() UpdateReplyDto: UpdateReplyDto
    ) {
        return await this.commentService.updateComment(id, {
            ...UpdateReplyDto,
            reqUserId: req.user.userId,
        })
    }
}
