import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { Roles } from "../auth/roles.decorator"

import { Post as UPost } from "./schema/post.schema"
import { PostService } from "./post.service"
import { createPostDto } from "./dto/create-post.dto"
import { FilesInterceptor } from "@nestjs/platform-express"
import { multerConfig } from "../config/multer.config"
import { RolesGuard } from "../auth/roles.guard"
import { IRequest } from "src/interface/request.interface"

@Roles("user")
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("post")
export class PostController {
    constructor(private postService: PostService) {}

    @Get("all")
    @Roles("admin")
    async getAllPosts(): Promise<UPost[]> {
        return await this.postService.getAllPosts()
    }

    @Get("/user")
    async findUserPosts(@Req() req: IRequest): Promise<UPost[]> {
        return this.postService.getUserPosts(req.user.userId)
    }

    @Post()
    @UseInterceptors(FilesInterceptor("files", 10, multerConfig))
    async createPost(
        @Req() req: IRequest,
        @UploadedFiles() files: Express.Multer.File[]
    ): Promise<UPost> {
        return await this.postService.createPost({
            postOwnerId: req.user.userId,
            content: files,
        })
    }

    @Get("/:id")
    async findPostById(@Param("id") id: string): Promise<UPost> {
        return await this.postService.getPostById(id)
    }

    // @Patch('/')
    // async updatePost(
    //     @Query('id') id: string,
    //     @Body() updatePostDto: updatePostDto,
    //     @Req() req: Request,
    // ): Promise<post> {
    //     return await this.postService.updatePost(id, {
    //         ...updatePostDto,
    //         reqUserId: req.user.userId,
    //     });
    // }
    @Delete("/:id")
    async deletePost(
        @Param("id") id: string,
        @Req() req: IRequest
    ): Promise<UPost> {
        return await this.postService.deletePost(id, req.user.userId)
    }

    @Post("/like/postId/:id")
    async likePost(
        @Param("id") id: string,
        @Req() req: IRequest
    ): Promise<UPost> {
        return await this.postService.likePost(id, req.user.userId)
    }

    @Post("/unlike/postId/:id")
    async unlikePost(
        @Param("id") id: string,
        @Req() req: IRequest
    ): Promise<UPost> {
        return await this.postService.unlikePost(id, req.user.userId)
    }
}
