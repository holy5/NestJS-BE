import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Delete,
    Req,
    UseGuards,
    Query,
    Param,
} from "@nestjs/common"
import { ReplyService } from "./reply.service"
import { CreateReplyDto } from "./dto/create-reply.dto"
import { UpdateReplyDto } from "./dto/update-reply.dto"
import { Roles } from "../auth/roles.decorator"
import { AuthGuard } from "@nestjs/passport"
import { RolesGuard } from "../auth/roles.guard"
import { IQuery } from "src/interface/query.interface"
import { IRequest } from "src/interface/request.interface"

@Roles("user")
@Controller("reply")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class ReplyController {
    constructor(private readonly replyService: ReplyService) {}

    @Post()
    async createReply(
        @Req() req: IRequest,
        @Body() createReplyDto: CreateReplyDto
    ) {
        return await this.replyService.createReply({
            ...createReplyDto,
            replyOwnerId: req.user.userId,
        })
    }

    @Roles("admin")
    @Get("/all")
    async getAllReplies() {
        return await this.replyService.getAllReplies()
    }

    @Get("commentId/:id")
    async getCommentReplies(@Param("id") id: string, @Query() query: IQuery) {
        return await this.replyService.getCommentReplies(id, query)
    }

    @Patch(":id")
    async updateReply(
        @Param("id") id: string,
        @Body() updateReplyDto: UpdateReplyDto,
        @Req() req: IRequest
    ) {
        return await this.replyService.updateReply(id, {
            ...updateReplyDto,
            reqUserId: req.user.userId,
        })
    }

    @Delete("/:id")
    async deleteReply(@Param("id") id: string, @Req() req: IRequest) {
        return await this.replyService.deleteReply(id, req.user.userId)
    }

    @Post("/like/replyId/:id")
    async likeReply(@Param("id") id: string, @Req() req: IRequest) {
        return await this.replyService.likeReply(id, req.user.userId)
    }

    @Post("/unlike/replyId/:id")
    async unlikeReply(@Param("id") id: string, @Req() req: IRequest) {
        return await this.replyService.unlikeReply(id, req.user.userId)
    }
}
