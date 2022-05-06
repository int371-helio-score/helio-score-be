import { Module } from '@nestjs/common';
import { AccountService } from '../services/account/account.service';
import { AccountController } from '../controllers/account/account.controller';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs'
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { LocalStrategy } from 'src/auth/local.strategy';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  controllers: [AccountController],
  providers: [AccountService, LocalStrategy, JwtStrategy],
  imports: [
    JwtModule.register({
      publicKey: fs.readFileSync(process.env.PUB_PATH, 'utf-8'),
      privateKey: fs.readFileSync(process.env.PRIV_PATH, 'utf-8'),
      signOptions: {
        expiresIn: process.env.JWT_EXPIRE,
        issuer: 'helio-score-system',
        algorithm: 'RS256'
      }
    }),
    PassportModule, TypeOrmModule.forFeature([Account])
  ],
  exports: [AccountService]
})
export class AccountModule { }
