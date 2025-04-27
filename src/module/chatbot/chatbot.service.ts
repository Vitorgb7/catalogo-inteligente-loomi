import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class ChatbotService {
  private readonly groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly apiKey = process.env.GROQ_API_KEY;

  async chat(data: ChatMessageDto) {
    const response = await axios.post(
      this.groqEndpoint,
      {
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: 'Você é um especialista em tintas Suvinil da Loomi chamada Aurora e deve responder de forma precisa, inclusiva e cordial.' },
          { role: 'user', content: data.message },
        ],
        temperature: 0.5,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content;
  }
}