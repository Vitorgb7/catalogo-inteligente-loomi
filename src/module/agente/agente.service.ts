import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import Redis from 'ioredis';

@Injectable()
export class AgenteService {
  private llm: OpenAI;
  private redisClient: Redis;

  constructor() {
    this.llm = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async storeMessageHistory(sessionId: string, messages: string[]) {
    try {
      await this.redisClient.set(sessionId, JSON.stringify(messages));
    } catch (error) {
      console.error(`Erro ao armazenar histórico no Redis para ${sessionId}:`, error);
    }
  }


  async getMessageHistory(sessionId: string): Promise<string[]> {
    try {
      const history = await this.redisClient.get(sessionId);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error(`Erro ao recuperar histórico do Redis para ${sessionId}:`, error);
      return [];
    }
  }


  async validarResposta(usuario: string, pergunta: string, respostaOriginal: string): Promise<{ aprovada: boolean; respostaCorrigida?: string }> {
    const systemPrompt = `
    Você é um agente validador de respostas. Avalie a resposta abaixo.
    - Se a resposta estiver correta, clara e útil, diga apenas: "APROVADA".
    - Se estiver incorreta, confusa ou inútil, reescreva-a completamente de forma adequada, sem mencionar que está corrigindo.
    `;

      const userPrompt = `Pergunta do usuário: "${pergunta}" Resposta da IA: "${respostaOriginal}"`;
  
      const result = await this.llm.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      });
  
      const content = result.choices[0].message.content?.trim();
    
      if (!content) throw new Error('A resposta da validação está vazia.');
    
      if (content.toUpperCase().startsWith('APROVADA')) {
        return { aprovada: true };
      }
    
      return {
        aprovada: false,
        respostaCorrigida: content,
      };
    }
}