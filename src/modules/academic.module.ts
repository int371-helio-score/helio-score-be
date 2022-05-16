import { Module } from '@nestjs/common';
import { AcademicService } from '../services/academic/academic.service';
import { AcademicController } from '../controllers/academic/academic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Academic } from 'src/entities/academic.entity';

@Module({
  controllers: [AcademicController],
  providers: [AcademicService],
  imports: [TypeOrmModule.forFeature([Academic])]
})
export class AcademicModule { }
