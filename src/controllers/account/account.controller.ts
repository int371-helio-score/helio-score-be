import { Controller, Post, Get, Request, UseGuards, Req, Body, Query, Patch } from '@nestjs/common';
import { GoogleAuthGuard } from 'src/auth/google-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { CreateAccountDto, ForgotPasswrodDto } from 'src/dto/account/create-account.dto';
import { AccountService } from '../../services/account/account.service';

@Controller('api/helio/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    try {
      return this.accountService.login(req.user)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }

  }

  @Post('register')
  async register(@Body() user: CreateAccountDto) {
    try {
      return this.accountService.register(user)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('info')
  getAccountInfo(@Request() req) {
    try {
      return this.accountService.getInfo(req.user)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }

  }

  @Get('verify-email?')
  async verifyEmail(@Query('token') token: any) {
    try {
      if (token === '') {
        return {
          statusCode: 400,
          message: "Token is not provided."
        }
      }
      return await this.accountService.verifyEmail(token)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(GoogleAuthGuard)
  @Get('auth/google')
  async googleLogin() { }

  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  async googleRedirect(@Req() req) {
    return this.accountService.loginWithGoogle(req)
  }

  @Post('forgotPassword')
  async forgotPassword(@Body() req: ForgotPasswrodDto) {
    try {
      return this.accountService.forgotPassword(req.email)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @Patch('changePassword')
  async changePassword() {

  }

}
