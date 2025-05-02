// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { TintaModule } from './module/tinta/tinta.module';
import { ChatbotModule } from './module/chatbot/chatbot.module';
import { QdrantService } from './module/chatbot/embeddings/qdrant.service';

@Module({
  imports: [TintaModule, ChatbotModule],
  providers: [QdrantService],
})
export class AppModule {}