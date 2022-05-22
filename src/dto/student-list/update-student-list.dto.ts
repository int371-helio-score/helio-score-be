import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentListDto } from './create-student-list.dto';

export class UpdateStudentListDto extends PartialType(CreateStudentListDto) { }
