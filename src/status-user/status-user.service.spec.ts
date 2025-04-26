import { Test, TestingModule } from '@nestjs/testing';
import { StatusUserService } from './status-user.service';

describe('StatusUserService', () => {
  let service: StatusUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusUserService],
    }).compile();

    service = module.get<StatusUserService>(StatusUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
