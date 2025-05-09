import { MemoryService } from './memory-service';
import { supabase } from './supabase';

interface TranscriptionOptions {
  model: 'whisper-1';
  language?: string;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json';
  temperature?: number;
}

interface TranscriptionResult {
  text: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  metadata: {
    model: string;
    language?: string;
    duration: number;
    timestamp: string;
  };
}

export class AudioTranscriptionService {
  private static instance: AudioTranscriptionService;
  private memoryService: MemoryService;
  private isInitialized: boolean = false;
  private apiKey: string | null = null;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
  }

  static getInstance(): AudioTranscriptionService {
    if (!AudioTranscriptionService.instance) {
      AudioTranscriptionService.instance = new AudioTranscriptionService();
    }
    return AudioTranscriptionService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    await this.memoryService.initialize();
    
    // Carrega a chave da API
    const savedApiKey = await this.loadApiKey();
    if (savedApiKey) {
      this.apiKey = savedApiKey;
    }

    this.isInitialized = true;
  }

  private async loadApiKey(): Promise<string | null> {
    try {
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', this.memoryService.getUserId())
        .single();

      return existingPrefs?.preferences?.openaiApiKey || null;
    } catch {
      return null;
    }
  }

  async setApiKey(apiKey: string) {
    if (!this.isInitialized) throw new Error('AudioTranscriptionService não inicializado');

    this.apiKey = apiKey;

    // Salva a chave da API
    await this.memoryService.updatePreference({
      key: 'openaiApiKey',
      value: apiKey
    });
  }

  async transcribeAudio(audioData: Blob, options: TranscriptionOptions): Promise<TranscriptionResult> {
    if (!this.isInitialized) throw new Error('AudioTranscriptionService não inicializado');
    if (!this.apiKey) throw new Error('API key não configurada');

    try {
      const formData = new FormData();
      formData.append('file', audioData, 'audio.wav');
      formData.append('model', options.model);
      if (options.language) formData.append('language', options.language);
      if (options.responseFormat) formData.append('response_format', options.responseFormat);
      if (options.temperature) formData.append('temperature', options.temperature.toString());

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao transcrever áudio');
      }

      const data = await response.json();
      const result: TranscriptionResult = {
        text: data.text,
        segments: data.segments,
        metadata: {
          model: options.model,
          language: options.language,
          duration: data.duration,
          timestamp: new Date().toISOString()
        }
      };

      // Registra a transcrição
      await this.memoryService.recordInteraction({
        type: 'feature_usage',
        content: 'audio_transcription',
        metadata: result
      });

      return result;
    } catch (error) {
      console.error('Erro ao transcrever áudio:', error);
      throw error;
    }
  }

  async getRecentTranscriptions(): Promise<TranscriptionResult[]> {
    if (!this.isInitialized) throw new Error('AudioTranscriptionService não inicializado');

    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', this.memoryService.getUserId())
      .eq('interaction_type', 'feature_usage')
      .eq('content', 'audio_transcription')
      .order('created_at', { ascending: false })
      .limit(10);

    return interactions?.map((interaction: any) => interaction.metadata as TranscriptionResult) || [];
  }
} 