import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { FileInterceptor } from "@nestjs/platform-express"
import { IRequest } from "src/interface/request.interface"
import { Roles } from "../auth/roles.decorator"
import { RolesGuard } from "../auth/roles.guard"
import { multerConfig } from "../config/multer.config"
import { createUserDto } from "./dto/create-user.dto"
import { updateUserDto } from "./dto/update-user.dto"
import { User } from "./schema/user.schema"
import { UserService } from "./user.service"

@Roles("user")
@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Get("all")
    @Roles("admin")
    async getAllUsers(): Promise<User[]> {
        return await this.userService.getAllUsers()
    }

    @Post()
    @UseInterceptors(FileInterceptor("avatar", multerConfig))
    async createUser(
        @Body() createUserDto: createUserDto,
        @UploadedFile() avatar: Express.Multer.File
    ) {
        return await this.userService.createUser({
            ...createUserDto,
            avatar,
            role: "user",
        })
    }

    @Get("/username/:keyword")
    async searchUser(@Param("keyword") keyword: string) {
        return await this.userService.searchUser(keyword)
    }

    @UseGuards(AuthGuard("jwt"))
    @Delete()
    async deleteUser(@Req() req: IRequest) {
        return await this.userService.deleteUser(req.user.userId)
    }

    @UseGuards(AuthGuard("jwt"))
    @Patch()
    async updateUser(
        @Req() req: IRequest,
        @Body() updateUserDto: updateUserDto
    ) {
        return await this.userService.updateUser(req.user.userId, updateUserDto)
    }

    @UseGuards(AuthGuard("jwt"))
    @Post("/follow/userId/:id")
    async followUser(@Req() req: IRequest, @Param("id") userId: string) {
        return await this.userService.followUser(req.user.userId, userId)
    }
    @UseGuards(AuthGuard("jwt"))
    @Post("/unfollow/userId/:id")
    async unfollowUser(@Req() req: IRequest, @Param("id") userId: string) {
        return await this.userService.unfollowUser(req.user.userId, userId)
    }
}
