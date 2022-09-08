import { Controller, Post, Get, Request, UseGuards, Body, Query, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { CreateAccountDto, EditAccountDto, EditSchool, GoogleDto } from 'src/dto/account/create-account.dto';
import { uploadWImage } from 'src/services/common/common.service';
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

  @UseGuards(JwtAuthGuard)
  @Patch('info')
  @UseInterceptors(FileInterceptor('image', uploadWImage))
  async editAccount(@Request() req: any, @Body() user: EditAccountDto, @UploadedFile() file: any) {
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

}
