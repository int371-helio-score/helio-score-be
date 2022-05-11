import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/services/common/common.service';
import { Account } from 'src/entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Account)
    private repo: Repository<Account>
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
    const payload = { id: user._id, email: user.email }
    return {
      accessToken: `Bearer ${this.jwtService.sign(payload)}`
    }
  }
}
