import { Module } from '@nestjs/common';
import { ClassService } from '../services/class/class.service';
import { ClassController } from '../controllers/class/class.controller';

@Module({
  controllers: [ClassController],
  providers: [ClassService]
})
export class ClassModule {}
