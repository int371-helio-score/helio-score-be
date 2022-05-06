import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local'
import { AccountService } from "src/services/account/account.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private accountService: AccountService
    ) {
        super({ usernameField: 'email' })
    }

    async validate(email: string, password: string) {
        const user = await this.accountService.validateUser(email, password)

        if (!user) {
            throw new UnauthorizedException();
        }
        return user
    }
}