import { MemoryService } from './memory-service';
import { supabase } from './supabase';

interface ImageGenerationOptions {
  model: 'dalle' | 'stable-diffusion';
  size: '256x256' | '512x512' | '1024x1024';
  style?: string;
  quality?: 'standard' | 'hd';
}

interface GeneratedImage {
  url: string;
  prompt: string;
  metadata: {
    model: string;
    size: string;
    style?: string;
    quality?: string;
    timestamp: string;
  };
}

export class ImageGenerationService {
  private static instance: ImageGenerationService;
  private memoryService: MemoryService;
  private isInitialized: boolean = false;
  private apiKey: string | null = null;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
  }

  static getInstance(): ImageGenerationService {
    if (!ImageGenerationService.instance) {
      ImageGenerationService.instance = new ImageGenerationService();
    }
    return ImageGenerationService.instance;
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

      return existingPrefs?.preferences?.imageGenerationApiKey || null;
    } catch {
      return null;
    }
  }

  async setApiKey(apiKey: string) {
    if (!this.isInitialized) throw new Error('ImageGenerationService não inicializado');

    this.apiKey = apiKey;

    // Salva a chave da API
    await this.memoryService.updatePreference({
      key: 'imageGenerationApiKey',
      value: apiKey
    });
  }

  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<GeneratedImage> {
    if (!this.isInitialized) throw new Error('ImageGenerationService não inicializado');
    if (!this.apiKey) throw new Error('API key não configurada');

    try {
      let imageUrl: string;

      if (options.model === 'dalle') {
        imageUrl = await this.generateWithDalle(prompt, options);
      } else {
        imageUrl = await this.generateWithStableDiffusion(prompt, options);
      }

      const generatedImage: GeneratedImage = {
        url: imageUrl,
        prompt,
        metadata: {
          model: options.model,
          size: options.size,
          style: options.style,
          quality: options.quality,
          timestamp: new Date().toISOString()
        }
      };

      // Registra a geração da imagem
      await this.memoryService.recordInteraction({
        type: 'feature_usage',
        content: 'image_generation',
        metadata: generatedImage
      });

      return generatedImage;
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      throw error;
    }
  }

  private async generateWithDalle(prompt: string, options: ImageGenerationOptions): Promise<string> {
    // Implementar integração com DALL·E
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: options.size,
        quality: options.quality || 'standard'
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar imagem com DALL·E');
    }

    const data = await response.json();
    return data.data[0].url;
  }

  private async generateWithStableDiffusion(prompt: string, options: ImageGenerationOptions): Promise<string> {
    // Implementar integração com Stable Diffusion
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: parseInt(options.size.split('x')[1]),
        width: parseInt(options.size.split('x')[0]),
        samples: 1,
        steps: 30,
        style_preset: options.style
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar imagem com Stable Diffusion');
    }

    const data = await response.json();
    return data.artifacts[0].base64;
  }

  async getRecentGenerations(): Promise<GeneratedImage[]> {
    if (!this.isInitialized) throw new Error('ImageGenerationService não inicializado');

    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', this.memoryService.getUserId())
      .eq('interaction_type', 'feature_usage')
      .eq('content', 'image_generation')
      .order('created_at', { ascending: false })
      .limit(10);

    return interactions?.map((interaction: any) => interaction.metadata as GeneratedImage) || [];
  }
} 