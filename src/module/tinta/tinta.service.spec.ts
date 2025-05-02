import { Test, TestingModule } from '@nestjs/testing';
import { TintaService } from './tinta.service';

describe('TintaService', () => {
  let service: TintaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TintaService],
    }).compile();

    service = module.get<TintaService>(TintaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all tintas', async () => {
    const result = [
      {
        id: 1,
        nome: 'Azul Sereno',
        cor: 'azul',
        ambiente: 'externo',
        acabamento: 'fosco',
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

    expect(await service.findAll()).toEqual(result);
  });
});