import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/services/common/common.service';
import { Account } from 'src/entities/account.entity';
import { MongoRepository } from 'typeorm';
import mongoose from 'mongoose';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AccountService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Account)
    private repo: MongoRepository<Account>
  ) { }

  @Inject()
  commonService: CommonService
  @Inject()
  mailService: MailService

  async findOne(email: string) {
    return this.repo.findOne({ where: { email: email } })
  }

  async validateUser(email: string, password: string) {
    const user = await this.findOne(email)
    const isValid = await this.commonService.compare(password, user.password)
    if (user && isValid) {
      if (user.verify) {
        const { password, ...rest } = user
        return rest
      }
      else {
        throw new UnauthorizedException('Account has not verify.')
      }
    }
    return null
  }

  async login(user: any) {
    const str = JSON.stringify(user._id)
    const userId = str.substring(str.indexOf('"') + 1, str.lastIndexOf('"'))
    const payload = { userId: userId, email: user.email }
    return {
      statusCode: 200,
      message: "success",
      data: {
        token: `Bearer ${this.jwtService.sign(payload, {
          expiresIn: process.env.JWT_EXPIRE,
          issuer: 'helio-score-system',
          algorithm: 'RS256'
        })}`
      }
    }
  }

  async register(user: any) {
    const isExist = await this.findOne(user.email)
    if (isExist) {
      throw new ConflictException("Email Already Exist.")
    }

    const newAccount = {
      email: user.email,
      password: await this.commonService.hashPassword(user.password),
      firstName: user.firstName,
      lastName: user.lastName,
      schoolId: user.schoolId,
      image: '',
      verify: false
    }

    this.repo.save(newAccount)
    //send verification link
    this.mailService.sendVerificationLink(user.email)

    return {
      statusCode: 200,
      message: "success"
    }
  }

  async getInfo(user: any) {
    const result = await this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(user.userId) } })
    if (result.length == 0) {
      return {
        statusCode: 404,
        message: "No Records."
      }
    }

    const obj = {
      firstName: result[0].firstName,
      lastName: result[0].lastName,
      email: result[0].email
    }

    return {
      statusCode: 200,
      message: "success",
      data: obj
    }
  }

  async loginWithGoogle(data: any) {
    if (!data.user) {
      throw new BadRequestException();
    }

    let user = (await this.repo.findBy({ where: { googleId: data.user.id } }))[0]

    if (user) {
      return this.login(user)
    }

    //find if user already create account w/o google
    user = (await this.repo.findBy({ where: { email: data.user.email } }))[0]
    if (user) {
      throw new ForbiddenException("User already exists, but Google account was not connected to user's account.")
    }

    //user sso first time then store account info
    try {
      const newAccount = new Account()
      newAccount.firstName = data.user.firstName
      newAccount.lastName = data.user.lastName
      newAccount.email = data.user.email
      newAccount.googleId = data.user.id
      newAccount.image = data.user.picture
      newAccount.verify = true

      await this.repo.save(newAccount)
      return this.login(newAccount)

    } catch (err: any) {
      return {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }

  async verifyEmail(token: any) {
    const verifyOptions = { secret: process.env.JWT_VERIFICATION_TOKEN_SECRET }
    const payload = await this.jwtService.verifyAsync(token, verifyOptions).catch((err: any) => {
      return {
        statusCode: 401,
        message: "Token is expired or invalid."
      }
    })

    const { email } = payload
    if (email) {
      await this.repo.update({ email: email }, { verify: true })
      return {
        statusCode: 200,
        message: "success"
      }
    }
    return payload
  }
}
