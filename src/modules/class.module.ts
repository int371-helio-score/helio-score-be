import { Module } from '@nestjs/common';
import { ClassService } from '../services/class/class.service';
import { ClassController } from '../controllers/class/class.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from 'src/entities/class.entity';

@Module({
  controllers: [ClassController],
  providers: [ClassService],
  imports: [TypeOrmModule.forFeature([Class])]
})
export class ClassModule { }
