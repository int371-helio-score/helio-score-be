import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentListService } from '../../services/student-list/student-list.service';
import { CreateStudentListDto } from '../../dto/student-list/create-student-list.dto';
import { UpdateStudentListDto } from '../../dto/student-list/update-student-list.dto';

@Controller('list-member')
export class StudentListController {
  constructor(private readonly StudentListService: StudentListService) {}

  @Post()
  create(@Body() createStudentListDto: CreateStudentListDto) {
    return this.StudentListService.create(createStudentListDto);
  }

  @Get()
  findAll() {
    return this.StudentListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.StudentListService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentListDto: UpdateStudentListDto) {
    return this.StudentListService.update(+id, updateStudentListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.StudentListService.remove(+id);
  }
}
