<p align="center">
  <a href="https://loomi.digital/" target="blank">
    <img src="https://media.licdn.com/dms/image/v2/C4D0BAQGwsGxOTrtcHw/company-logo_200_200/company-logo_200_200/0/1654903803329/loomi_digital_logo?e=1751500800&v=beta&t=NkGLY1OjbpF7JEUgWBtickYwma_eGy4jGfdYf2SbAHE" width="120" alt="Loomi Logo" />
  </a>
</p>

<h1 align="center">Catálogo Inteligente de Tintas com IA</h1>

---

##  Descrição

Este projeto foi desenvolvido como um desafio técnico para a Loomi Digital. O objetivo era implementar um serviço de chatbot com:

- Capacidade de gerar respostas textuais e por imagens com base em contexto previamente salvo.
- Sistema de validação das respostas antes de retorná-las ao usuário.
- Arquitetura escalável e bem estruturada com foco em boas práticas.

A solução proposta foi construída com **NestJS**, aplicando princípios de **modularidade**, **injeção de dependência**, e um fluxo organizado para criação de embeddings, recuperação de contexto, agentes de validação de respostas e de recomendações.

---

## ⚙️ Instalação e Execução

### 1. Subindo os serviços com Docker Compose

Antes de iniciar a aplicação, certifique-se de que os serviços de banco de dados estejam em execução:

```bash
docker-compose up -d
```

## Isso inicializa os seguintes serviços:

```
Qdrant: Para vetorização e busca por similaridade.

Redis: Para cache e validação.

PostgreSQL: Para armazenamento relacional dos dados.
```


## Instalando dependências
```
npm install
```
## Inicializando a aplicação
```
npm run start
```
```
npm run start:dev
```
```
npm run start:prod
```
## Inicialização com Swagger (documentação da API)
```
npm start --filter api
```
O Swagger ficará disponível em: http://localhost:3000/api (ou porta configurada no ambiente)

## Executando os testes
O projeto já conta com testes automatizados. Para executá-los, use:

```
npm run test
```

--
# 🔎 Como Funciona
O fluxo do chatbot foi dividido em três partes principais:

### Geração de Embeddings
O texto inserido pelo usuário é transformado em vetores (embeddings) e comparado com vetores previamente armazenados no Qdrant, buscando contexto relevante.

### Geração da Resposta
Com base na pergunta e no contexto encontrado, o sistema gera uma resposta estruturada e coerente com a base.

### Validação
A resposta passa por uma etapa de verificação através de regras lógicas ou validação via Redis. Pode ser corrigida, rejeitada ou aprovada automaticamente.

### Resposta Final
A resposta validada é enviada ao usuário final.

📁 Estrutura de Pastas
```
src/
├── module/
│   ├── chatbot/
│   │   ├── embeddings/      
│   │   ├── dto/             
│   │   ├── agente/          
│   │   ├── data/            
│   └── tinta/  
│       ├── dto/
│       ├── tinta.controller.ts
│       ├── tinta.module.ts
│       ├── tinta.service.ts
│       ├── tinta.service.spec.ts
│   └── agente/  
│       ├── agente-recomendador.service.ts
│       ├── agente.service.ts  
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   ├── main.ts

```
## Tecnologias Utilizadas
Node.js

NestJS

TypeScript

Redis

PostgreSQL

Qdrant

OpenIA

Swagger

Docker & Docker Compose

Jest (para testes automatizados)

# Conclusão
O projeto apresenta uma base sólida para construção de assistentes inteligentes, permitindo fácil integração com múltiplos serviços e validações. Pode ser expandido para aplicações como catálogos inteligentes, recomendadores de produtos, atendimento automatizado, entre outros.