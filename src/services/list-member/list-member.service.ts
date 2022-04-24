import { Injectable } from '@nestjs/common';
import { CreateListMemberDto } from '../../dto/list-member/create-list-member.dto';
import { UpdateListMemberDto } from '../../dto/list-member/update-list-member.dto';

@Injectable()
export class ListMemberService {
  create(createListMemberDto: CreateListMemberDto) {
    return 'This action adds a new listMember';
  }

  findAll() {
    return `This action returns all listMember`;
  }

  findOne(id: number) {
    return `This action returns a #${id} listMember`;
  }

  update(id: number, updateListMemberDto: UpdateListMemberDto) {
    return `This action updates a #${id} listMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} listMember`;
  }
}
