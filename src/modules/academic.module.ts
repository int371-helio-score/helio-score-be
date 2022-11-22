import { Module, forwardRef } from '@nestjs/common';
import { AcademicService } from '../services/academic/academic.service';
import { AcademicController } from '../controllers/academic/academic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Academic } from 'src/entities/academic.entity';
import { SubjectModule } from './subject.module';

@Module({
  controllers: [AcademicController],
  providers: [AcademicService],
  imports: [TypeOrmModule.forFeature([Academic]), forwardRef(() => SubjectModule)],
  exports: [AcademicService]
})
export class AcademicModule { }
