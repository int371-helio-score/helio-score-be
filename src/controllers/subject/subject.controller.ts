import { Controller, Get } from '@nestjs/common';
import { SubjectService } from '../../services/subject/subject.service';

@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) { }

}
