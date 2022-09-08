import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { JwtPayload } from "jsonwebtoken"

import { UserService } from "../user/user.service"

export interface LoginResponse {
    access_token: string
}

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = (await this.userService.getUserFullInfo(username)) as any

        if (user && (await user.comparePassword(password))) {
            const { password, ...result } = user.toObject()
            return result
        } else {
            throw new HttpException(
                "Invalid Credential",
                HttpStatus.UNAUTHORIZED
            )
        }
    }

    async login(user: JwtPayload): Promise<LoginResponse> {
        const payload = {
            username: user.username,
            sub: user._id,
            role: user.role,
        }
        return {
            access_token: this.jwtService.sign(payload),
        }
    }
}
