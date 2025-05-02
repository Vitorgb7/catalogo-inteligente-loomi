import { Injectable } from '@nestjs/common';
import { ChatMessageDto } from './dto/chat-message.dto';
import { LoadEmbeddingsService } from './embeddings/load-embedding.service';
import { AgenteService } from '../agente/agente.service';
import { OpenAI } from 'openai';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor(
    private readonly embedService: LoadEmbeddingsService,
    private readonly agenteService: AgenteService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
      project: process.env.OPENAI_PROJECT_ID,
    });
  }

  async chat(data: ChatMessageDto) {
    console.log(`Nova mensagem recebida: "${data.message}"`);
    console.log('Gerando embedding da entrada do usuário...');

    const userEmbedding = await this.embedService.createEmbedding(data.message);

    console.log('Buscando contextos similares no Qdrant...');
    const relatedChunks = await this.embedService.searchSimilarContexts(userEmbedding);

    console.log(`Contextos similares encontrados: ${relatedChunks.length}`);

    const prompt = `
    Você é Aurora, uma especialista da Loomi em tintas Suvinil. Com base nas informações abaixo, responda a pergunta do usuário de forma clara, direta, educada, respeitosa e com muita empatia.

    Base de conhecimento:
    ${relatedChunks.map((c, i) => `Trecho ${i + 1}: ${c}`).join('\n\n')}

    Pergunta:
    ${data.message}
    `;

    console.log('Enviando prompt para LLM...');
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Você é Aurora, uma especialista da Loomi em tintas Suvinil' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 600,
    });

    const respostaGerada = completion.choices[0].message.content;
    if (!respostaGerada) {
      throw new Error('A resposta gerada pela LLM é nula.');
    }
    console.log('Resposta gerada com sucesso pela LLM.');

    const resultadoValidacao = await this.agenteService.validarResposta(
      data.userId || 'default',
      data.message,
      respostaGerada,
    );

    const respostaFinal = resultadoValidacao.aprovada
      ? respostaGerada
      : resultadoValidacao.respostaCorrigida || respostaGerada;

    return respostaFinal;
  }
}