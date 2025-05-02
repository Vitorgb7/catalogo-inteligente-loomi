import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { QdrantService } from './embeddings/qdrant.service';
import { LoadEmbeddingsService } from './embeddings/load-embedding.service';
import { AgenteService } from '../agente/agente.service';
import { AgenteRecomendadorService } from '../agente/agente-recomendador.service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, QdrantService, LoadEmbeddingsService, AgenteService, AgenteRecomendadorService],
})
export class ChatbotModule {}