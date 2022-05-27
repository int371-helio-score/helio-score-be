import { Controller, Post, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { AccountService } from '../../services/account/account.service';

@Controller('api/helio/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
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

}
