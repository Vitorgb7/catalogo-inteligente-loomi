import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from './chatbot.service';
import { LoadEmbeddingsService } from './embeddings/load-embedding.service';
import { AgenteService } from '../agente/agente.service';
import { AgenteRecomendadorService } from '../agente/agente-recomendador.service';
import { ChatMessageDto } from './dto/chat-message.dto';

jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Resposta gerada pela LLM.' } }],
          }),
        },
      },
      images: {
        generate: jest.fn().mockResolvedValue({
          data: [{ url: 'imagem-gerada.png' }],
        }),
      },
    })),
  };
});

describe('ChatbotService', () => {
  let service: ChatbotService;
  let embedService: LoadEmbeddingsService;
  let agenteService: AgenteService;
  let recomendadorService: AgenteRecomendadorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        {
          provide: LoadEmbeddingsService,
          useValue: {
            createEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
            searchSimilarContexts: jest.fn().mockResolvedValue(['A tinta azul é ideal para ambientes externos.']),
          },
        },
        {
          provide: AgenteService,
          useValue: {
            validarResposta: jest.fn().mockResolvedValue({
              aprovada: true,
              respostaCorrigida: null,
            }),
          },
        },
        {
          provide: AgenteRecomendadorService,
          useValue: {
            recomendarTinta: jest.fn().mockResolvedValue('Use a tinta fosca azul para ambientes externos.'),
          },
        },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
    embedService = module.get<LoadEmbeddingsService>(LoadEmbeddingsService);
    agenteService = module.get<AgenteService>(AgenteService);
    recomendadorService = module.get<AgenteRecomendadorService>(AgenteRecomendadorService);
  });

  it('deve retornar recomendação de tinta se a mensagem for sobre pintura', async () => {
    const input: ChatMessageDto = {
      message: 'Preciso pintar minha sala com uma tinta resistente.',
      userId: 'usuario123',
    };

    const resposta = await service.chat(input);

    expect(embedService.createEmbedding).toHaveBeenCalledWith(input.message);
    expect(embedService.searchSimilarContexts).toHaveBeenCalled();
    expect(recomendadorService.recomendarTinta).toHaveBeenCalledWith(input.message);
    expect(resposta).toEqual('Use a tinta fosca azul para ambientes externos.');
  });

  it('deve retornar resposta validada da LLM se não for uma pergunta de recomendação', async () => {
    const input: ChatMessageDto = {
      message: 'Qual é a diferença entre tinta acrílica e látex?',
      userId: 'usuario123',
    };

    const resposta = await service.chat(input);

    expect(embedService.createEmbedding).toHaveBeenCalled();
    expect(embedService.searchSimilarContexts).toHaveBeenCalled();
    expect(recomendadorService.recomendarTinta).not.toHaveBeenCalled();
    expect(agenteService.validarResposta).toHaveBeenCalled();
    expect(resposta).toEqual('Resposta gerada pela LLM.');
  });
});