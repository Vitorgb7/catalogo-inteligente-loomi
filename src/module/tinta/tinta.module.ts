import { Module } from '@nestjs/common';
import { TintaController } from './tinta.controller';
import { TintaService } from './tinta.service';

@Module({
  controllers: [TintaController],
  providers: [TintaService],
})
export class TintaModule {}