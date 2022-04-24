import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const config: TypeOrmModuleOptions = {
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: 'practice',
    entities: ['dist/entities/*.js'],
    synchronize: true,
    useNewUrlParser: true,
    autoLoadEntities: true
}