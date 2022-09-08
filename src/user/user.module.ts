import { Module } from "@nestjs/common"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { MongooseModule } from "@nestjs/mongoose"
import { User, UserSchema } from "./schema/user.schema"
import * as bcrypt from "bcryptjs"
import { NextFunction } from "express"
import { PostModule } from "src/post/post.module"
import { IUser } from "src/interface/user.interface"

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: User.name,
                useFactory: () => {
                    UserSchema.pre<IUser>(
                        "save",
                        async function (next: NextFunction) {
                            const salt = await bcrypt.genSalt(10)
                            this.password = await bcrypt.hash(
                                this.password,
                                salt
                            )
                            next()
                        }
                    )
                    return UserSchema
                },
            },
        ]),
        PostModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
