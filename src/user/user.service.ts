import { HttpException, HttpStatus, Injectable, Res } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { UploadApiResponse } from "cloudinary"
import mongoose, { Model } from "mongoose"
import { PostService } from "../post/post.service"

import { checkObjectIdValidity } from "../utils/checkObjectIdValidity"
import { uploadStream } from "../utils/uploadStream"
import { createUserDto } from "./dto/create-user.dto"
import { updateUserDto } from "./dto/update-user.dto"
import { IUser } from "../interface/user.interface"
import { User } from "./schema/user.schema"

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<IUser>,
        private readonly postService: PostService
    ) {}

    async getAllUsers(): Promise<User[]> {
        return await this.userModel.find()
    }

    async createUser(createUserDto: createUserDto): Promise<User> {
        const { email, username, avatar } = createUserDto
        const userExisted = await this.userModel.findOne({
            $or: [{ username: { $eq: username } }, { email: { $eq: email } }],
        })
        if (userExisted) {
            throw new HttpException("User already exists", HttpStatus.CONFLICT)
        }
        const userId = new mongoose.Types.ObjectId()
        let res: UploadApiResponse[]
        if (avatar) {
            res = await uploadStream(`users/${userId}/avatar`, [avatar])
        }

        await new this.userModel({
            ...createUserDto,
            avatar: res ? res[0].secure_url : "",
            _id: userId,
        }).save()

        return await this.userModel.findById(userId).select("-password")

        // const { password, ...result } = newUser.toObject()
        // return result as unknown as User
    }

    async searchUser(search: string): Promise<IUser> {
        const user = await this.userModel
            .findOne({
                $or: [
                    {
                        username: { $eq: search },
                    },
                    { email: { $eq: search } },
                ],
            })
            .select("-password")
        if (!user) {
            throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND)
        } else {
            return user
        }
    }

    async getUserFullInfo(search: string): Promise<IUser> {
        return await this.userModel.findOne({
            $or: [{ username: { $eq: search } }, { email: { $eq: search } }],
        })
    }

    async deleteUser(userId: string): Promise<User> {
        checkObjectIdValidity([userId])
        const user = await this.userModel.findById(userId).select("-password")
        if (!user) {
            throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND)
        }
        await this.postService.deleteAllUserPosts(userId)
        return await user.remove()
    }

    async updateUser(
        userId: string,
        updateUserDto: updateUserDto
    ): Promise<User> {
        checkObjectIdValidity([userId])
        return await this.userModel
            .findByIdAndUpdate(userId, updateUserDto, {
                new: true,
            })
            .select("-password")
    }

    async followUser(reqUserId: string, followUserId: string): Promise<User> {
        checkObjectIdValidity([reqUserId, followUserId])

        const followingUser = await this.userModel
            .findById(reqUserId)
            .select("-password")

        const followedUser = await this.userModel
            .findById(followUserId)
            .select("-password")

        if (!followingUser) {
            throw new HttpException(
                "Request user not found",
                HttpStatus.NOT_FOUND
            )
        }

        if (!followedUser) {
            throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND)
        }

        if (followingUser.followings.users?.includes(followUserId)) {
            throw new HttpException(
                "Already follow this user",
                HttpStatus.CONFLICT
            )
        }

        await this.userModel
            .findByIdAndUpdate(
                followUserId,
                {
                    $inc: {
                        "followers.total": 1,
                    },
                    $push: {
                        "followers.users": reqUserId,
                    },
                },
                {
                    new: true,
                }
            )
            .select("-password")

        return await this.userModel
            .findByIdAndUpdate(
                reqUserId,
                {
                    $inc: {
                        "followings.total": 1,
                    },
                    $push: {
                        "followings.users": followUserId,
                    },
                },
                {
                    new: true,
                }
            )
            .select("-password")
    }

    async unfollowUser(reqUserId: string, followUserId: string): Promise<User> {
        checkObjectIdValidity([reqUserId, followUserId])

        const followingUser = await this.userModel
            .findById(reqUserId)
            .select("-password")

        const followedUser = await this.userModel
            .findById(followUserId)
            .select("-password")

        if (!followingUser) {
            throw new HttpException(
                "Request user not found",
                HttpStatus.NOT_FOUND
            )
        }

        if (!followedUser) {
            throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND)
        }

        if (!followingUser.followings.users?.includes(followUserId)) {
            throw new HttpException(
                "Already unfollow this user",
                HttpStatus.CONFLICT
            )
        }

        await this.userModel
            .findByIdAndUpdate(
                followUserId,
                {
                    $inc: {
                        "followers.total": -1,
                    },
                    $pull: {
                        "followers.users": reqUserId,
                    },
                },
                {
                    new: true,
                }
            )
            .select("-password")

        return await this.userModel
            .findByIdAndUpdate(
                reqUserId,
                {
                    $inc: {
                        "followings.total": -1,
                    },
                    $pull: {
                        "followings.users": followUserId,
                    },
                },
                {
                    new: true,
                }
            )
            .select("-password")
    }
}
