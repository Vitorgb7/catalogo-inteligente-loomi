import { Injectable } from '@nestjs/common';
import { ChatMessageDto } from './dto/chat-message.dto';
import { LoadEmbeddingsService } from './embeddings/load-embedding.service';
import { AgenteService } from '../agente/agente.service';
import { AgenteRecomendadorService } from '../agente/agente-recomendador.service';
import { OpenAI } from 'openai';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor(
    private readonly embedService: LoadEmbeddingsService,
    private readonly agenteService: AgenteService,
    private readonly recomendadorService: AgenteRecomendadorService,
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

    try {
      const userEmbedding = await this.embedService.createEmbedding(data.message);
      console.log('Gerando embedding com sucesso!');

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

      console.log('Enviando prompt para LLM');
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

      // Só gera imagem se a mensagem do usuário tiver um pedido claro de visualização
      if (
        data.message.toLowerCase().includes('me recomenda') ||
        data.message.toLowerCase().includes('quero pintar') ||
        data.message.toLowerCase().includes('preciso pintar')
      ) {
        const recomendacao = await this.recomendadorService.recomendarTinta(data.message);

        console.log('Recomendação gerada:', recomendacao);

        if (recomendacao.includes('Desculpe, não encontrei')) {
          return recomendacao;
        }

        // Não gerar imagem se não houver uma solicitação explícita
        if (this.isImageRequest(data.message)) {
          const imagePrompt = `Ambiente moderno pintado com ${recomendacao}, com iluminação natural e decoração aconchegante.`;
          const imageUrl = await this.generateImageFromPrompt(imagePrompt);

          return `Recomendação: ${recomendacao}\n\nVisualização da ideia:\n${imageUrl}`;
        }

        return `Recomendação: ${recomendacao}`;
      }

      if (
        data.message.toLowerCase().includes('visualizar') ||
        data.message.toLowerCase().includes('como ficaria')
      ) {
        const visualPrompt = `Ambiente pintado com tinta ${data.message.replace(/(visualizar|como ficaria)/gi, '')}, estilo moderno e elegante.`;
        const imageUrl = await this.generateImageFromPrompt(visualPrompt);

        return `Aqui está uma sugestão visual com base na sua descrição:\n${imageUrl}`;
      }

      const respostaFinal = resultadoValidacao.aprovada
        ? respostaGerada
        : resultadoValidacao.respostaCorrigida || respostaGerada;

      return respostaFinal;

    } catch (error) {
      console.error('Erro no processamento da requisição:', error);
      throw new Error('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.');
    }
  }

  private isImageRequest(message: string): boolean {
    const imageKeywords = ['visualizar', 'como ficaria', 'imagem', 'foto', 'mostrar', 'exibir'];
    return imageKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private async generateImageFromPrompt(prompt: string): Promise<string> {
    console.log('Enviando prompt para geração de imagem com DALL·E...');

    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('Não foi possível gerar a imagem com DALL·E.');
      }

      console.log('Imagem gerada com sucesso.');
      return imageUrl;
    } catch (error) {
      console.error('Erro ao gerar a imagem:', error);
      throw new Error('Não foi possível gerar a imagem com o modelo DALL·E. Por favor, tente novamente mais tarde.');
    }
  }
}