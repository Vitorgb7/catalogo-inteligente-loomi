import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateTintaDto } from './dto/create-tinta.dto';
import { ApiTags } from '@nestjs/swagger';
import { TintaService } from './tinta.service';

@ApiTags('tintas')
@Controller('tintas')
export class TintaController {
  constructor(private readonly tintaService: TintaService) {}

  @Post()
  create(@Body() createTintaDto: CreateTintaDto) {
    return this.tintaService.create(createTintaDto);
  }

  @Get()
  findAll() {
    return this.tintaService.findAll();
  }
}