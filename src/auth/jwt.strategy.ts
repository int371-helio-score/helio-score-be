import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'
import * as fs from 'fs'
import { AccountService } from "src/services/account/account.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: fs.readFileSync(process.env.PUB_PATH, 'utf-8'),
            algorithms: ['RS256']
        })
    }

    @Inject()
    accountService: AccountService

    async validate(payload: any) {
        return { userId: payload.userId, email: payload.email }
    }
}