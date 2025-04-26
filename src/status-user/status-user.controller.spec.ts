import { Test, TestingModule } from '@nestjs/testing';
import { StatusUserController } from './status-user.controller';

describe('StatusUserController', () => {
  let controller: StatusUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusUserController],
    }).compile();

    controller = module.get<StatusUserController>(StatusUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
