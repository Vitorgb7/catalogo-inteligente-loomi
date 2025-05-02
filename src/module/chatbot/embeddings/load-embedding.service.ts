import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { OpenAI } from 'openai';
import { QdrantService } from './qdrant.service';

@Injectable()
export class LoadEmbeddingsService implements OnModuleInit {
  private openai: OpenAI;

  constructor(private readonly qdrantService: QdrantService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
      project: process.env.OPENAI_PROJECT_ID,
    });
  }

  async onModuleInit() {
    console.log('iniciando carregamento dos embeddings do CSV');
    const csvRows: string[] = [];

    await new Promise<void>((resolve) => {
      fs.createReadStream('./src/module/chatbot/data/Base_de_Dados_de_Tintas_Suvinil.csv')
        .pipe(csv())
        .on('data', (row) => {
          const content = Object.values(row).join(' | ');
          csvRows.push(content);
        })
        .on('end', () => {
          console.log(`Total de linhas do csv carregadas: ${csvRows.length}`);
          resolve();
        });
    });

    const batchSize = 10;
    for (let i = 0; i < csvRows.length; i += batchSize) {
      const chunk = csvRows.slice(i, i + batchSize);
      console.log(`Gerando embeddings para batch ${i / batchSize + 1} com ${chunk.length} entradas`);

      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk,
      });

      const payload = chunk.map((text, idx) => ({
        content: text,
        embedding: embeddingResponse.data[idx].embedding,
      }));

      console.log(`Enviando batch ${i / batchSize + 1} para o Qdrant`);
      await this.qdrantService.upsert(payload);
    }

    console.log('Todos os embeddings foram gerados e salvos no Qdrant.');
  }

  async createEmbedding(text: string): Promise<number[]> {
    console.log('Gerando embedding para o texto fornecido');
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: [text],
    });
    console.log('Embedding gerado com sucesso!');
    return embeddingResponse.data[0].embedding;
  }

  async searchSimilarContexts(userEmbedding: number[], topK = 3): Promise<string[]> {
    console.log(`Buscando os ${topK} contextos mais similares`);
    const result = await this.qdrantService.search(userEmbedding, topK);
    console.log(`Resultados encontrados: ${result.length}`);
    return result;
  }
}