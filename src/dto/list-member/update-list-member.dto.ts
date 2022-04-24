import { PartialType } from '@nestjs/mapped-types';
import { CreateListMemberDto } from './create-list-member.dto';

export class UpdateListMemberDto extends PartialType(CreateListMemberDto) {}
