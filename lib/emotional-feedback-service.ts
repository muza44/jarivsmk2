import { MemoryService } from './memory-service';
import { ThemeService } from './theme-service';
import { supabase } from './supabase';

interface EmotionalState {
  mood: 'happy' | 'sad' | 'angry' | 'tired' | 'focused' | 'calm';
  energy: number; // 0-100
  stress: number; // 0-100
  timestamp?: string;
  context?: string;
}

interface EmotionalResponse {
  message: string;
  tone: 'casual' | 'formal' | 'concerned' | 'excited';
  themeMood: 'happy' | 'calm' | 'energetic' | 'focused';
  suggestions?: string[];
}

interface EmotionalFeedback {
  state: EmotionalState;
  response: EmotionalResponse;
}

export class EmotionalFeedbackService {
  private static instance: EmotionalFeedbackService;
  private memoryService: MemoryService;
  private themeService: ThemeService;
  private currentState: EmotionalState;
  private isInitialized: boolean = false;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
    this.themeService = ThemeService.getInstance();
    this.currentState = this.getDefaultState();
  }

  static getInstance(): EmotionalFeedbackService {
    if (!EmotionalFeedbackService.instance) {
      EmotionalFeedbackService.instance = new EmotionalFeedbackService();
    }
    return EmotionalFeedbackService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    await this.memoryService.initialize();
    await this.themeService.initialize();
    
    // Carrega estado salvo ou usa o padrão
    const savedState = await this.loadSavedState();
    if (savedState) {
      this.currentState = savedState;
    }

    this.isInitialized = true;
  }

  private getDefaultState(): EmotionalState {
    return {
      mood: 'calm',
      energy: 70,
      stress: 30
    };
  }

  private async loadSavedState(): Promise<EmotionalState | null> {
    try {
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', this.memoryService.getUserId())
        .single();

      return existingPrefs?.preferences?.emotionalState as EmotionalState || null;
    } catch {
      return null;
    }
  }

  async updateEmotionalState(newState: Partial<EmotionalState>) {
    if (!this.isInitialized) throw new Error('EmotionalFeedbackService não inicializado');

    this.currentState = {
      ...this.currentState,
      ...newState
    };

    // Salva o estado atualizado
    await this.memoryService.updatePreference({
      key: 'emotionalState',
      value: this.currentState
    });

    // Atualiza o tema baseado no humor
    await this.updateThemeBasedOnMood();
  }

  private async updateThemeBasedOnMood() {
    const { mood, energy, stress } = this.currentState;
    let themeMood: 'happy' | 'calm' | 'energetic' | 'focused';

    if (mood === 'happy' || (energy > 70 && stress < 30)) {
      themeMood = 'happy';
    } else if (mood === 'tired' || energy < 30) {
      themeMood = 'calm';
    } else if (mood === 'focused' || (energy > 50 && stress < 50)) {
      themeMood = 'focused';
    } else {
      themeMood = 'energetic';
    }

    await this.themeService.updateThemeBasedOnMood(themeMood);
  }

  async analyzeUserState(interaction: string): Promise<EmotionalResponse> {
    if (!this.isInitialized) throw new Error('EmotionalFeedbackService não inicializado');

    // Análise básica do texto para detectar humor
    const lowerInteraction = interaction.toLowerCase();
    let detectedMood: EmotionalState['mood'] = 'calm';
    let tone: EmotionalResponse['tone'] = 'casual';

    if (lowerInteraction.includes('cansado') || lowerInteraction.includes('exausto')) {
      detectedMood = 'tired';
      tone = 'concerned';
    } else if (lowerInteraction.includes('feliz') || lowerInteraction.includes('ótimo')) {
      detectedMood = 'happy';
      tone = 'excited';
    } else if (lowerInteraction.includes('estressado') || lowerInteraction.includes('irritado')) {
      detectedMood = 'angry';
      tone = 'concerned';
    } else if (lowerInteraction.includes('focado') || lowerInteraction.includes('concentrado')) {
      detectedMood = 'focused';
      tone = 'formal';
    }

    // Atualiza o estado emocional
    const updatedState: EmotionalState = {
      ...this.currentState,
      mood: detectedMood,
      timestamp: new Date().toISOString(),
      context: interaction
    };
    await this.updateEmotionalState(updatedState);

    // Gera resposta apropriada
    const response = this.generateResponse(detectedMood, tone);
    
    // Registra a interação
    await this.memoryService.recordInteraction({
      type: 'feature_usage',
      content: 'emotional_feedback',
      metadata: {
        state: updatedState,
        response
      }
    });

    return response;
  }

  private generateResponse(mood: EmotionalState['mood'], tone: EmotionalResponse['tone']): EmotionalResponse {
    const responses: Record<EmotionalState['mood'], { casual: string; formal: string; concerned: string; excited: string }> = {
      tired: {
        casual: 'Parece que você está cansado. Quer que eu ajuste o ambiente para ficar mais confortável?',
        formal: 'Percebi que você pode estar cansado. Posso ajudar a criar um ambiente mais adequado?',
        concerned: 'Você parece estar cansado. Está tudo bem? Posso ajudar com algo?',
        excited: 'Mesmo cansado, vamos fazer algo produtivo! Que tal um ambiente mais energético?'
      },
      happy: {
        casual: 'Que bom que você está feliz! Vamos aproveitar esse momento?',
        formal: 'É ótimo ver você em um bom humor. Como posso ajudar?',
        concerned: 'Fico feliz que você esteja bem! Quer compartilhar o que te deixou assim?',
        excited: 'Que energia positiva! Vamos fazer algo incrível!'
      },
      angry: {
        casual: 'Parece que algo te incomodou. Quer conversar sobre isso?',
        formal: 'Percebi que você pode estar estressado. Posso ajudar a resolver algo?',
        concerned: 'Está tudo bem? Parece que algo te deixou chateado.',
        excited: 'Vamos transformar essa energia em algo positivo!'
      },
      focused: {
        casual: 'Você está bem focado! Vamos manter esse ritmo?',
        formal: 'Excelente nível de concentração. Como posso ajudar a manter isso?',
        concerned: 'Está tudo bem com tanta concentração? Não se esqueça de dar uma pausa.',
        excited: 'Que energia incrível! Vamos aproveitar esse momento de foco!'
      },
      sad: {
        casual: 'Parece que você está um pouco triste. Quer conversar?',
        formal: 'Percebi que você pode estar se sentindo para baixo. Posso ajudar?',
        concerned: 'Está tudo bem? Quer falar sobre o que te deixou assim?',
        excited: 'Vamos melhorar seu dia! Que tal fazer algo que você gosta?'
      },
      calm: {
        casual: 'Que ambiente tranquilo! Está tudo bem?',
        formal: 'Percebo que você está calmo. Como posso ajudar?',
        concerned: 'Está tudo bem com tanta calma? Quer fazer algo mais energético?',
        excited: 'Que paz! Vamos aproveitar esse momento!'
      }
    };

    return {
      message: responses[mood][tone],
      tone,
      themeMood: this.getThemeMoodFromEmotionalState(mood),
      suggestions: this.getSuggestionsForMood(mood)
    };
  }

  private getThemeMoodFromEmotionalState(mood: EmotionalState['mood']): 'happy' | 'calm' | 'energetic' | 'focused' {
    switch (mood) {
      case 'happy':
        return 'happy';
      case 'tired':
      case 'sad':
        return 'calm';
      case 'angry':
        return 'energetic';
      case 'focused':
        return 'focused';
      default:
        return 'calm';
    }
  }

  private getSuggestionsForMood(mood: EmotionalState['mood']): string[] {
    const suggestions: Record<EmotionalState['mood'], string[]> = {
      tired: [
        'Tente fazer uma pausa e descansar um pouco',
        'Que tal ouvir uma música relaxante?',
        'Ajuste a iluminação para um tom mais suave'
      ],
      happy: [
        'Aproveite esse momento positivo!',
        'Que tal compartilhar sua alegria com alguém?',
        'Registre esse momento no seu diário'
      ],
      angry: [
        'Respire fundo e tente se acalmar',
        'Faça uma pausa e beba água',
        'Tente identificar a causa do estresse'
      ],
      focused: [
        'Mantenha esse nível de concentração!',
        'Faça pequenas pausas para manter o foco',
        'Organize suas tarefas por prioridade'
      ],
      sad: [
        'Lembre-se que isso é temporário',
        'Converse com alguém sobre como você se sente',
        'Faça algo que você gosta para melhorar o humor'
      ],
      calm: [
        'Aproveite esse momento de paz',
        'Mantenha esse estado de tranquilidade',
        'Registre seus pensamentos no diário'
      ]
    };

    return suggestions[mood];
  }

  getCurrentState(): EmotionalState {
    return { ...this.currentState };
  }

  async getRecentFeedbacks(): Promise<EmotionalFeedback[]> {
    if (!this.isInitialized) throw new Error('EmotionalFeedbackService não inicializado');

    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', this.memoryService.getUserId())
      .eq('interaction_type', 'feature_usage')
      .eq('content', 'emotional_feedback')
      .order('created_at', { ascending: false })
      .limit(10);

    return interactions?.map((interaction: any) => interaction.metadata as EmotionalFeedback) || [];
  }
} 