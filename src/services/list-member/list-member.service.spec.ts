import { Test, TestingModule } from '@nestjs/testing';
import { ListMemberService } from './list-member.service';

describe('ListMemberService', () => {
  let service: ListMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListMemberService],
    }).compile();

    service = module.get<ListMemberService>(ListMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
