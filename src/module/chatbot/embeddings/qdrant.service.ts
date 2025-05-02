import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly client: QdrantClient;
  private readonly collectionName = 'tintas_suvinil';

  constructor() {
    this.client = new QdrantClient({
      url: 'http://localhost:6333',
    });
    console.log('Qdrant client inicializado.');
  }

  async onModuleInit() {
    await this.createCollection();
  }

  async createCollection() {
    const exists = await this.client.getCollections();
    const alreadyExists = exists.collections.some(
      (c) => c.name === this.collectionName,
    );

    if (!alreadyExists) {
      console.log(`Criando a coleção '${this.collectionName}' no Qdrant`);
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 1536, 
          distance: 'Cosine',
        },
      });
      console.log('Coleção criada com sucesso.');
    } else {
      console.log(`A coleção '${this.collectionName}' já existe.`);
    }
  }

  async upsert(payload: { content: string; embedding: number[] }[]) {
    console.log(`Upsert no Qdrant com ${payload.length} itens`);

    await this.client.upsert(this.collectionName, {
      points: payload.map((item, i) => ({
        id: Date.now() + i,
        vector: item.embedding,
        payload: { content: item.content },
      })),
    });
  }

  async search(embedding: number[], topK: number): Promise<string[]> {
    const result = await this.client.search(this.collectionName, {
      vector: embedding,
      limit: topK,
      with_payload: true,
    });

    return result.map((r) => r.payload?.content as string);
  }
}