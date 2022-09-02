import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt'
import { diskStorage } from 'multer'

@Injectable()
export class CommonService {
    async compare(password: string, hashed: string) {
        return await bcrypt.compare(password, hashed)
    }

    async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
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

const filterImage = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/json') {
        cb(null, true)
    }
    cb(null, false)
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

export const uploadWImage = {
    storage: diskStorage({
        destination: './public/images',
        filename: formatFileName
    }),
    fileFilter: filterImage
}