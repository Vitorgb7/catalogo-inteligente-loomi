import { Body, Controller, Get, Post } from '@nestjs/common';
import { TintaService } from './tinta.service';
import { CreateTintaDto } from './dto/create-tinta.dto';

@Controller('tintas')
export class TintaController {
  constructor(private readonly service: TintaService) {}

  @Post()
  create(@Body() data: CreateTintaDto) {
    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}