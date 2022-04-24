import { Module } from '@nestjs/common';
import { AccountService } from '../services/account/account.service';
import { AccountController } from '../controllers/account/account.controller';

@Module({
  controllers: [AccountController],
  providers: [AccountService]
})
export class AccountModule {}
