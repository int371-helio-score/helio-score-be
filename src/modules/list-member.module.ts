import { Module } from '@nestjs/common';
import { ListMemberService } from '../services/list-member/list-member.service';
import { ListMemberController } from '../controllers/list-member/list-member.controller';

@Module({
  controllers: [ListMemberController],
  providers: [ListMemberService]
})
export class ListMemberModule {}
