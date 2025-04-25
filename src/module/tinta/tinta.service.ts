import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTintaDto } from './dto/create-tinta.dto';

const prisma = new PrismaClient();

@Injectable()
export class TintaService {
  async create(data: CreateTintaDto) {
    return prisma.tinta.create({ data });
  }

  async findAll() {
    return prisma.tinta.findMany();
  }
}