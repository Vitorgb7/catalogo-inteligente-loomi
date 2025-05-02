import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as natural from 'natural';

@Injectable()
export class AgenteRecomendadorService {
  private prisma = new PrismaClient();
  private tokenizer = new natural.WordTokenizer();

  async recomendarTinta(mensagem: string): Promise<string> {
    const entidades = this.extrairEntidades(mensagem);

    const tintas = await this.prisma.tinta.findMany({
      where: {
        ...(entidades.ambiente && { ambiente: { contains: entidades.ambiente, mode: 'insensitive' } }),
        ...(entidades.superficie && { superficie: { contains: entidades.superficie, mode: 'insensitive' } }),
        ...(entidades.acabamento && { acabamento: { contains: entidades.acabamento, mode: 'insensitive' } }),
        ...(entidades.cor && { cor: { contains: entidades.cor, mode: 'insensitive' } }),
        ...(entidades.feature && { features: { hasSome: [entidades.feature] } }),
      },
      take: 3,
    });

    if (!tintas.length) {
      return 'Desculpe, não encontrei nenhuma tinta que corresponda aos critérios fornecidos.';
    }

    return `Com base no que você descreveu, recomendo:\n\n` +
      tintas.map(t =>
        `• ${t.nome} — Cor: ${t.cor}, Acabamento: ${t.acabamento}, Ambiente: ${t.ambiente}, Superfície: ${t.superficie}, Linha: ${t.linha}.`
      ).join('\n');
  }

  private extrairEntidades(texto: string): any {
    const tokens = this.tokenizer.tokenize(texto.toLowerCase());

    const ambientes = ['interno', 'externo', 'quarto', 'cozinha', 'banheiro', 'varanda'];
    const superficies = ['parede', 'reboco', 'madeira', 'metal', 'alvenaria'];
    const acabamentos = ['fosco', 'acetinado', 'brilhante'];
    const cores = ['azul', 'branco', 'cinza', 'verde', 'amarelo', 'vermelho'];
    const features = ['lavável', 'sem odor', 'anti-mofo'];

    return {
      ambiente: this.findKeyword(ambientes, tokens),
      superficie: this.findKeyword(superficies, tokens),
      acabamento: this.findKeyword(acabamentos, tokens),
      cor: this.findKeyword(cores, tokens),
      feature: this.findKeyword(features, tokens),
    };
  }

  private findKeyword(keywords: string[], tokens: string[]): string | null {
    return tokens.find(token => keywords.includes(token)) || null;
  }
}