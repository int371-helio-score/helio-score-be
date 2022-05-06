import { TypeOrmModuleOptions } from "@nestjs/typeorm";

require('dotenv').config({ path: `${process.cwd()}/env/${process.env.NODE_ENV}.env` })

export const config: TypeOrmModuleOptions = {
    type: 'mongodb',
    host: process.env.DB_HOST,
    port: parseInt(<string>process.env.DB_PORT),
    database: process.env.DB_NAME,
    entities: ['dist/entities/*.js'],
    synchronize: true,
    useNewUrlParser: true,
    autoLoadEntities: true
}