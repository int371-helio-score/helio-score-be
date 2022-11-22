import { BadRequestException, ConflictException, ForbiddenException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService, getFileName } from 'src/services/common/common.service';
import { Account } from 'src/entities/account.entity';
import { MongoRepository } from 'typeorm';
import mongoose from 'mongoose';
import { MailService } from '../mail/mail.service';
import { lov } from 'src/entities/lov.entities';
import * as fs from 'fs'
import { SchoolService } from '../school/school.service';
import { SubjectService } from '../subject/subject.service';
import { StudentListService } from '../student-list/student-list.service';

@Injectable()
export class AccountService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(Account)
    private repo: MongoRepository<Account>,

    @InjectRepository(lov)
    private lovRepo: MongoRepository<lov>
  ) { }

  @Inject()
  commonService: CommonService
  @Inject(forwardRef(() => MailService))
  mailService: MailService
  @Inject()
  schoolService: SchoolService
  @Inject()
  subjectService: SubjectService
  @Inject()
  studentListService: StudentListService

  async findOne(email: string) {
    return this.repo.findOne({ where: { email: email } })
  }

  async validateUser(email: string, password: string) {
    const user = await this.findOne(email.toLowerCase())
    if (!user) {
      return null
    }
    const isValid = await this.commonService.compare(password, user.password)
    if (user && isValid) {
      if (user.verify) {
        const { password, ...rest } = user
        return rest
      }
      else {
        throw new UnauthorizedException('Account has not been verified.')
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
        })}`,
        school: user.schoolId
      }
    }
  }

  async register(user: any) {
    const isExist = await this.findOne(user.email)
    if (isExist) {
      throw new ConflictException("Email Already Exist.")
    }

    const binary = (await this.lovRepo.find({ where: { lovType: 'image' } }))[0].lovName;
    //convert to base64
    const img = binary.toString().replace('new Binary(', '').replace(', 0)', '');


    const newAccount = {
      email: user.email.toLowerCase(),
      password: await this.commonService.hashPassword(user.password),
      firstName: user.firstName,
      lastName: user.lastName,
      schoolId: user.schoolId,
      image: Buffer.from(img),
      verify: false
    }

    await this.repo.save(newAccount)

    // const regUser = await this.repo.findOne({ where: { email: user.email } })
    // await this.login(regUser)
    //send verification link
    await this.mailService.sendVerificationLink(newAccount.email)
    return {
      statusCode: 200,
      message: 'success'
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

    const school = await this.schoolService.findBySchoolId(result[0].schoolId)

    const obj = {
      firstName: result[0].firstName,
      lastName: result[0].lastName,
      email: result[0].email,
      schoolName: school.length == 0 ? null : school[0].schoolName,
      image: null,
      google: false
    }

    if (result[0].googleId) {
      obj.image = result[0].image
      obj.google = true
    } else {
      obj.image = (result[0].image).toString().replace('new Binary(', '').replace(', 0)', '')
    }

    return {
      statusCode: 200,
      message: "success",
      data: obj
    }
  }

  async loginWithGoogle(data: any) {
    if (!data) {
      throw new BadRequestException();
    }

    let user = (await this.repo.findBy({ where: { googleId: data.googleId } }))[0]

    if (user) {
      return this.login(user)
    }

    //find if user already create account w/o google
    user = (await this.repo.findBy({ where: { email: data.email } }))[0]
    if (user) {
      throw new ForbiddenException("User already exists, but Google account was not connected to user's account.")
    }

    //user sso first time then store account info
    try {
      const newAccount = new Account()
      newAccount.firstName = data.firstName
      newAccount.lastName = data.lastName
      newAccount.email = data.email
      newAccount.googleId = data.googleId
      newAccount.image = data.image
      newAccount.schoolId = 0
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
    const payload = await this.verifyToken(token)
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

  async verifyToken(token: any) {
    const verifyOptions = { secret: process.env.JWT_VERIFICATION_TOKEN_SECRET }
    const payload = await this.jwtService.verifyAsync(token, verifyOptions).catch((err: any) => {
      return {
        statusCode: 401,
        message: "Token is expired or invalid."
      }
    })
    return payload
  }

  async resetPasswordByEmail(token: any, newPassword: string) {
    const payload = await this.verifyToken(token)
    const { email } = payload
    if (email) {
      await this.repo.update({ email: email }, { password: await this.commonService.hashPassword(newPassword) })
      return {
        statusCode: 200,
        message: "success"
      }
    }
    return payload

  }

  async editAccount(token: any, user: any) {
    let img: any;

    const imgFile = getFileName()

    if (imgFile == "") {
      const result = await this.findOne(token.email)
      img = result.image
    } else {
      const file = fs.readFileSync(`./public/images/${imgFile}`)
      img = `data:image/${imgFile.split('.').pop()};base64,${file.toString('base64')}`
    }

    await this.repo.update({ email: token.email }, { firstName: user.firstName, lastName: user.lastName, image: img })

    if (imgFile) {
      fs.unlinkSync(`./public/images/${imgFile}`)
    }

    return {
      statusCode: 200,
      message: "success"
    }
  }

  async editSchool(user: any, school_id: number) {
    await this.repo.update({ email: user.email }, { schoolId: school_id })
    return {
      statusCode: 200,
      message: "success"
    }
  }

  async editPassword(user: any, currentPwd: string, newPwd: string) {
    const result = await this.findOne(user.email)
    if (!result) {
      return {
        statusCode: 404,
        message: "Account not found."
      }
    }

    const isMatch = await this.commonService.compare(currentPwd, result.password)
    if (!isMatch) {
      return {
        statusCode: 401,
        message: "Current Password is incorrect."
      }
    }

    result.password = await this.commonService.hashPassword(newPwd)

    await this.repo.save(result)
    return {
      statusCode: 200,
      message: "success"
    }
  }

  async deleteAccount(user: any) {
    const result = await this.findOne(user.email)
    if (!result) {
      return {
        statusCode: 404,
        message: "Account not found."
      }
    }

    const subjectList = await this.subjectService.findByUserId(user.userId)
    if (subjectList) {
      for (const each of subjectList) {
        await this.subjectService.deleteSubject(each._id)
      }
    }

    const stdList = await this.studentListService.find(user.userId)
    if (stdList) {
      for (const each of stdList) {
        await this.studentListService.deleteStudentListById(each._id)
      }
    }

    await this.repo.deleteOne({ _id: new mongoose.Types.ObjectId(user.userId) })
    return {
      statusCode: 200,
      message: "success"
    }
  }

  async findById(userId: string) {
    try {
      return this.repo.findBy({ where: { _id: new mongoose.Types.ObjectId(userId) } })
    } catch (err: any) {
      throw {
        statusCode: err.statuscode,
        message: err.originalError
      }
    }
  }
}
