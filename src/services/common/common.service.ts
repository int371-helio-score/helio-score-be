import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt'
import { diskStorage } from 'multer'

@Injectable()
export class CommonService {
    async compare(password: string, hashed: string) {
        return await bcrypt.compare(password, hashed)
    }
}

var fileName = ''

const formatFileName = (req: any, file: any, cb: any) => {
    const date = Date.now()
    const fileExtName = '.' + file.originalname.split('.')[1]
    fileName = `${date}${fileExtName}`
    cb(null, fileName)
}

const filter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'text/csv') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

export const getFileName = () => {
    let tmp = fileName
    fileName = ''
    return tmp
}

export const upload = {
    storage: diskStorage({
        destination: './public/files',
        filename: formatFileName
    }),
    fileFilter: filter
}