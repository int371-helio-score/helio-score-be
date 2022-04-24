import { Test, TestingModule } from '@nestjs/testing';
import { ListMemberController } from './list-member.controller';
import { ListMemberService } from '../../services/list-member/list-member.service';

describe('ListMemberController', () => {
  let controller: ListMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListMemberController],
      providers: [ListMemberService],
    }).compile();

    controller = module.get<ListMemberController>(ListMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
