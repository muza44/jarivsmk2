import { MemoryService } from './memory-service';
import { MultimodalService } from './multimodal-service';
import { DailySummaryService } from './daily-summary-service';
import { PersonalityService } from './personality-service';

interface VoiceCommand {
  pattern: string | RegExp;
  action: (params: any) => Promise<string | void>;
  description: string;
}

export class VoiceCommandService {
  private static instance: VoiceCommandService;
  private memoryService: MemoryService;
  private multimodalService: MultimodalService;
  private commands: VoiceCommand[] = [];
  private isInitialized: boolean = false;
  private personalityService: PersonalityService;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
    this.multimodalService = MultimodalService.getInstance();
    this.personalityService = PersonalityService.getInstance();
  }

  static getInstance(): VoiceCommandService {
    if (!VoiceCommandService.instance) {
      VoiceCommandService.instance = new VoiceCommandService();
    }
    return VoiceCommandService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    await this.memoryService.initialize();
    await this.multimodalService.initialize();
    
    // Registra comandos padrão
    this.registerDefaultCommands();
    
    this.isInitialized = true;
  }

  private registerDefaultCommands() {
    this.registerCommand({
      pattern: /mostrar clima/i,
      action: async () => {
        // Implementar ação de mostrar clima
        console.log('Mostrando clima...');
      },
      description: 'Mostra o clima atual'
    });

    this.registerCommand({
      pattern: /abrir mvp/i,
      action: async () => {
        // Implementar ação de abrir MVP
        console.log('Abrindo MVP...');
      },
      description: 'Abre o MVP'
    });

    this.registerCommand({
      pattern: /me atualize/i,
      action: async () => {
        const summaryService = DailySummaryService.getInstance();
        await summaryService.initialize();
        const summary = await summaryService.generateDailySummary();
        const formattedSummary = await summaryService.formatSummaryAsText(summary);
        
        // Registra a interação
        await this.memoryService.recordInteraction({
          type: 'command_execution',
          content: 'daily_summary',
          metadata: { summary, formattedSummary }
        });

        // Retorna o resumo formatado para ser exibido
        return formattedSummary;
      },
      description: 'Gera um resumo completo do dia'
    });

    this.registerCommand({
      pattern: /abrir (.*)/i,
      action: async (params: { transcript: string }) => {
        const module = params.transcript.toLowerCase().replace('abrir ', '').trim();
        
        // Mapeia comandos de voz para rotas
        const moduleRoutes: Record<string, string> = {
          'resumo': '/daily-summary',
          'feedback': '/emotional-feedback',
          'imagem': '/image-generation',
          'áudio': '/audio-transcription',
          'configurações': '/api-config'
        };

        const route = moduleRoutes[module];
        if (route) {
          // Navega para a rota correspondente
          window.location.href = route;
          return `Abrindo ${module}...`;
        }

        return `Módulo "${module}" não encontrado`;
      },
      description: 'Abre um módulo específico'
    });
  }

  registerCommand(command: VoiceCommand) {
    this.commands.push(command);
  }

  async processVoiceCommand(audioData: Blob): Promise<{ success: boolean; message: string }> {
    if (!this.isInitialized) throw new Error('VoiceCommandService não inicializado');

    try {
      // Transcreve o áudio usando o serviço multimodal
      const transcript = await this.multimodalService.processVoiceInput(audioData);
      if (!transcript) {
        return { success: false, message: 'Não foi possível entender o comando' };
      }

      // Registra a interação
      await this.memoryService.recordInteraction({
        type: 'voice_command',
        content: transcript,
        metadata: { timestamp: new Date().toISOString() }
      });

      // Procura por um comando correspondente
      const command = this.commands.find(cmd => {
        if (typeof cmd.pattern === 'string') {
          return transcript.toLowerCase().includes(cmd.pattern.toLowerCase());
        }
        return cmd.pattern.test(transcript);
      });

      if (command) {
        const result = await command.action({ transcript });
        
        // Se o comando retornou uma string, usa como mensagem
        if (typeof result === 'string') {
          const response = await this.personalityService.generateResponse(result);
          return { success: true, message: response.message };
        }

        const response = await this.personalityService.generateResponse(
          `Comando executado: ${command.description}`
        );
        return { success: true, message: response.message };
      }

      // Se não encontrou um comando específico, tenta processar como comando de navegação
      const navigationMatch = transcript.match(/abrir (.*)/i);
      if (navigationMatch) {
        const module = navigationMatch[1].toLowerCase().trim();
        const moduleRoutes: Record<string, string> = {
          'resumo': '/daily-summary',
          'feedback': '/emotional-feedback',
          'imagem': '/image-generation',
          'áudio': '/audio-transcription',
          'configurações': '/api-config'
        };

        const route = moduleRoutes[module];
        if (route) {
          window.location.href = route;
          const response = await this.personalityService.generateResponse(
            `Abrindo ${module}...`
          );
          return { success: true, message: response.message };
        }
      }

      // Se não encontrou nenhum comando, gera uma resposta com personalidade
      const response = await this.personalityService.generateResponse(
        'Desculpe, não entendi esse comando. Pode tentar de outra forma?'
      );
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Erro ao processar comando de voz:', error);
      const response = await this.personalityService.generateResponse(
        'Ops, tive um problema ao processar seu comando. Pode tentar novamente?'
      );
      return { success: false, message: response.message };
    }
  }

  getAvailableCommands(): string[] {
    return this.commands.map(cmd => cmd.description);
  }
} 