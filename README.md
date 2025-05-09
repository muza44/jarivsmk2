# Painel Jarvis

Um painel pessoal inteligente estilo Jarvis, construído com Next.js, Supabase e OpenAI.

## Funcionalidades

- 🎯 Dashboard personalizável
- 🎙️ Transcrição de áudio com OpenAI Whisper
- 🤖 Análises de apostas e insights com GPT
- 📊 Integração com Twitch, Clima e Esportes
- 🔐 Autenticação com Google
- 🌙 Tema claro/escuro
- 📱 Design responsivo

## Tecnologias

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- OpenAI API
- Radix UI
- Shadcn/ui

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta na OpenAI
- Conta no Twitch Developer Portal
- Conta no OpenWeather

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/painel-jarvis.git
cd painel-jarvis
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Copie o arquivo .env.example para .env.local e preencha as variáveis:
```bash
cp .env.example .env.local
```

4. Configure as variáveis de ambiente no arquivo .env.local:
- NEXT_PUBLIC_SUPABASE_URL: URL do seu projeto Supabase
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Chave anônima do Supabase
- OPENAI_API_KEY: Chave da API OpenAI
- TWITCH_CLIENT_ID: Client ID do Twitch
- TWITCH_CLIENT_SECRET: Client Secret do Twitch
- OPENWEATHER_API_KEY: Chave da API OpenWeather

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

6. Acesse http://localhost:3000 no seu navegador.

## Configuração do Supabase

1. Crie um novo projeto no Supabase
2. Configure a autenticação com Google:
   - Vá para Authentication > Providers
   - Habilite o Google provider
   - Configure as credenciais OAuth do Google
3. Crie as tabelas necessárias:
   - profiles
   - transcripts
   - insights
   - favorites

## Estrutura do Projeto

```
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Páginas do dashboard
│   └── globals.css    # Estilos globais
├── components/        # Componentes React
├── lib/              # Utilitários e configurações
├── public/           # Arquivos estáticos
└── styles/           # Estilos adicionais
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter)

Link do Projeto: [https://github.com/seu-usuario/painel-jarvis](https://github.com/seu-usuario/painel-jarvis) 