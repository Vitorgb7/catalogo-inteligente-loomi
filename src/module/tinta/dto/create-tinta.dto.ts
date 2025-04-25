// apps/api/src/modules/tinta/dto/create-tinta.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateTintaDto {
  @ApiProperty()
  nome: string;

  @ApiProperty()
  cor: string;

  @ApiProperty()
  superficie: string;

  @ApiProperty()
  ambiente: string;

  @ApiProperty()
  acabamento: string;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty()
  linha: string;
}