import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GG_CLIENT_ID,
            clientSecret: process.env.GG_SECRET,
            callbackURL: "http://localhost:3000/api/helio/account/google/redirect",
            scope: ['email', 'profile'],
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        const { name, emails } = profile
        //resize image
        const img = profile._json.picture.replace("=s96-c", "=s300-c")
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: img,
            id: profile.id,
            accessToken,
        }

        done(null, user)
    }

}