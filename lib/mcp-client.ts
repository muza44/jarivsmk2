import { supabase } from './supabase';

export type CommandType = 
  | 'gerar_mvp'
  | 'analisar_imagem'
  | 'responder_ia'
  | 'enviar_mensagem'
  | 'atualizar_clima'
  | 'verificar_apostas'
  | 'tocar_musica'
  | 'agendar_compromisso';

interface CommandResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export class MCPClient {
  private static instance: MCPClient;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  async initialize() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  async executeCommand(
    type: CommandType,
    params: Record<string, any> = {}
  ): Promise<CommandResponse> {
    if (!this.userId) {
      throw new Error('MCPClient não inicializado. Chame initialize() primeiro.');
    }

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          params,
          userId: this.userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao executar comando');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao executar comando:', error);
      return {
        status: 'error',
        message: 'Erro ao executar comando',
      };
    }
  }

  // Métodos auxiliares para comandos específicos
  async gerarMVP(prompt: string) {
    return this.executeCommand('gerar_mvp', { prompt });
  }

  async analisarImagem(imageUrl: string) {
    return this.executeCommand('analisar_imagem', { imageUrl });
  }

  async responderIA(pergunta: string) {
    return this.executeCommand('responder_ia', { pergunta });
  }

  async enviarMensagem(destinatario: string, mensagem: string) {
    return this.executeCommand('enviar_mensagem', { destinatario, mensagem });
  }

  async atualizarClima(cidade: string) {
    return this.executeCommand('atualizar_clima', { cidade });
  }

  async verificarApostas() {
    return this.executeCommand('verificar_apostas');
  }

  async tocarMusica(musica: string) {
    return this.executeCommand('tocar_musica', { musica });
  }

  async agendarCompromisso(titulo: string, data: string, descricao?: string) {
    return this.executeCommand('agendar_compromisso', { titulo, data, descricao });
  }
} 