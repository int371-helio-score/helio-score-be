import { Module } from '@nestjs/common';
import { GroupService } from '../services/group/group.service';
import { GroupController } from '../controllers/group/group.controller';

@Module({
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
