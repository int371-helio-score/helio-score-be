import { Controller, Post, Get, Request, UseGuards, Body, Query, Patch } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
// import { FileInterceptor } from '@nestjs/platform-express';
import { ChangePasswordDto, CreateAccountDto, EditAccountDto, EditSchool, GoogleDto, ForgotPasswordDto } from 'src/dto/account/create-account.dto';
// import { uploadWImage } from 'src/services/common/common.service';
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

  @Post('google/redirect')
  async googleRedirect(@Body() req: GoogleDto) {
    return this.accountService.loginWithGoogle(req)
  }

  @Post('forgotPassword')
  async forgotPassword(@Body() req: ForgotPasswordDto) {
    try {
      return this.accountService.forgotPassword(req.email)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
  @UseGuards(JwtAuthGuard)
  @Patch('info')
  // @UseInterceptors(FileInterceptor('image', uploadWImage))
  // @UploadedFile() file: any
  async editAccount(@Request() req: any, @Body() user: EditAccountDto) {
    try {
      return this.accountService.editAccount(req.user, user)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('school')
  async editSchool(@Request() req: any, @Body() body: EditSchool) {
    try {
      return await this.accountService.editSchool(req.user, body.schoolId)
    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(@Request() req: any, @Body() body: ChangePasswordDto) {
    try {
      return await this.accountService.editPassword(req.user, body.currentPassword, body.newPassword)
    } catch (err: any) {
      return {
        stausCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
