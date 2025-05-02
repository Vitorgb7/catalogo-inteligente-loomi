import { Injectable } from '@nestjs/common';

@Injectable()
export class IntentInterpreterService {
  interpretUserIntent(message: string): string {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('recomenda') || lowerCaseMessage.includes('quero pintar') || lowerCaseMessage.includes('preciso pintar')) {
      return 'recomendacao_tinta';
    }

    if (lowerCaseMessage.includes('visualizar') || lowerCaseMessage.includes('como ficaria') || lowerCaseMessage.includes('imagem') || lowerCaseMessage.includes('foto')) {
      return 'visualizar_ambiente'; 
    }

    return 'outro';
  }
}