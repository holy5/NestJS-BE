import {
    Controller,
    forwardRef,
    Inject,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { AuthService, LoginResponse } from './auth.service'

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService
    ) {}

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Req() req: Request): Promise<LoginResponse> {
        return await this.authService.login(req.user)
    }
}

