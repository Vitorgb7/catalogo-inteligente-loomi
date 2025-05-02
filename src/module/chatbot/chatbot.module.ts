import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { QdrantService } from './embeddings/qdrant.service';
import { LoadEmbeddingsService } from './embeddings/load-embedding.service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, QdrantService, LoadEmbeddingsService],
})
export class ChatbotModule {}