import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt'

@Injectable()
export class CommonService {
    async compare(password: string, hashed: string) {
        return await bcrypt.compare(password, hashed)
    }
}