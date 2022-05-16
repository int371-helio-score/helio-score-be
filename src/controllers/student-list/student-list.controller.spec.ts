import { Test, TestingModule } from '@nestjs/testing';
import { StudentListController } from './student-list.controller';
import { StudentListService } from '../../services/student-list/student-list.service';

describe('StudentListController', () => {
  let controller: StudentListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentListController],
      providers: [StudentListService],
    }).compile();

    controller = module.get<StudentListController>(StudentListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
