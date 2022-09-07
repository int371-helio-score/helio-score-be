import { Module } from '@nestjs/common';
import { SchoolService } from '../services/school/school.service';
import { SchoolController } from '../controllers/school/school.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from 'src/entities/school.entity';

@Module({
  controllers: [SchoolController],
  providers: [SchoolService],
  imports: [TypeOrmModule.forFeature([School])]
})
export class SchoolModule {}
