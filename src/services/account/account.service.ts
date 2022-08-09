import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/services/common/common.service';
import { Account } from 'src/entities/account.entity';
import { MongoRepository } from 'typeorm';
import mongoose from 'mongoose';

@Injectable()
export class AccountService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Account)
    private repo: MongoRepository<Account>
  ) { }

  @Inject()
  commonService: CommonService

  async findOne(email: string) {
    return this.repo.findOne({ where: { email: email } })
  }

  async validateUser(email: string, password: string) {
    const user = await this.findOne(email)
    const isValid = await this.commonService.compare(password, user.password)
    if (user && isValid) {
      const { password, ...rest } = user
      return rest
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
      data: { token: `Bearer ${this.jwtService.sign(payload)}` }
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
}
