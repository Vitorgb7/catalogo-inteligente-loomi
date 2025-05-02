import { Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QdrantService {
  private readonly qdrant: QdrantClient;
  private readonly collectionName = 'tintas_suvinil';

  constructor() {
    this.qdrant = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
    });

    console.log('⚙️ Qdrant client inicializado.');
  }

  async upsert(
    data: { content: string; embedding: number[] }[],
  ): Promise<void> {
    console.log(`📝 Upsert no Qdrant com ${data.length} itens...`);
    await this.qdrant.upsert(this.collectionName, {
      points: data.map((item) => ({
        id: uuidv4(),
        vector: item.embedding,
        payload: { content: item.content },
      })),
    });
    console.log('✅ Dados inseridos no Qdrant com sucesso.');
  }

  async search(vector: number[], topK = 3): Promise<string[]> {
    console.log(`🔎 Realizando busca por similaridade no Qdrant (top ${topK})...`);
    const result = await this.qdrant.search(this.collectionName, {
      vector,
      limit: topK,
    });

    const respostas = result
      .map((r) => r.payload?.content)
      .filter((content): content is string => typeof content === 'string');
    console.log(`🔁 ${respostas.length} resultados retornados do Qdrant.`);
    return respostas;
  }
}