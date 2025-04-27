import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TintaModule } from './module/tinta/tinta.module';
import { ChatbotModule } from './module/chatbot/chatbot.module';


@Module({
  imports: [TintaModule, ChatbotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}