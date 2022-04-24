import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ListMemberService } from '../../services/list-member/list-member.service';
import { CreateListMemberDto } from '../../dto/list-member/create-list-member.dto';
import { UpdateListMemberDto } from '../../dto/list-member/update-list-member.dto';

@Controller('list-member')
export class ListMemberController {
  constructor(private readonly listMemberService: ListMemberService) {}

  @Post()
  create(@Body() createListMemberDto: CreateListMemberDto) {
    return this.listMemberService.create(createListMemberDto);
  }

  @Get()
  findAll() {
    return this.listMemberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listMemberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListMemberDto: UpdateListMemberDto) {
    return this.listMemberService.update(+id, updateListMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listMemberService.remove(+id);
  }
}
