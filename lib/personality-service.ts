import { MemoryService } from './memory-service';
import { EmotionalFeedbackService } from './emotional-feedback-service';

interface PersonalityTraits {
  humor: number; // 0-100
  formality: number; // 0-100
  sarcasm: number; // 0-100
  empathy: number; // 0-100
}

interface PersonalityResponse {
  message: string;
  tone: 'casual' | 'formal' | 'sarcastic' | 'empathetic';
  emoji?: string;
}

export class PersonalityService {
  private static instance: PersonalityService;
  private memoryService: MemoryService;
  private emotionalService: EmotionalFeedbackService;
  private traits: PersonalityTraits;
  private isInitialized: boolean = false;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
    this.emotionalService = EmotionalFeedbackService.getInstance();
    this.traits = this.getDefaultTraits();
  }

  static getInstance(): PersonalityService {
    if (!PersonalityService.instance) {
      PersonalityService.instance = new PersonalityService();
    }
    return PersonalityService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    await this.memoryService.initialize();
    await this.emotionalService.initialize();
    
    // Carrega traços salvos ou usa o padrão
    const savedTraits = await this.loadSavedTraits();
    if (savedTraits) {
      this.traits = savedTraits;
    }

    this.isInitialized = true;
  }

  private getDefaultTraits(): PersonalityTraits {
    return {
      humor: 70,
      formality: 40,
      sarcasm: 60,
      empathy: 80
    };
  }

  private async loadSavedTraits(): Promise<PersonalityTraits | null> {
    try {
      const { data: existingPrefs } = await this.memoryService.getPreferences();
      return existingPrefs?.personalityTraits || null;
    } catch {
      return null;
    }
  }

  async generateResponse(input: string, context: any = {}): Promise<PersonalityResponse> {
    if (!this.isInitialized) throw new Error('PersonalityService não inicializado');

    const emotionalState = this.emotionalService.getCurrentState();
    const timeOfDay = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());

    // Ajusta o tom baseado no contexto
    let tone: PersonalityResponse['tone'] = 'casual';
    if (this.traits.formality > 70) tone = 'formal';
    if (this.traits.sarcasm > 70 && Math.random() > 0.5) tone = 'sarcastic';
    if (this.traits.empathy > 70 && emotionalState.stress > 50) tone = 'empathetic';

    // Gera emoji baseado no contexto
    const emoji = this.generateEmoji(emotionalState, timeOfDay, isWeekend);

    // Gera mensagem baseada no tom
    const message = this.generateMessage(input, tone, emotionalState, timeOfDay, isWeekend);

    return { message, tone, emoji };
  }

  private generateEmoji(state: any, timeOfDay: number, isWeekend: boolean): string {
    const emojis = {
      happy: ['😊', '😄', '🌟'],
      tired: ['😴', '💤', '🌙'],
      focused: ['🎯', '💡', '⚡'],
      calm: ['😌', '🌿', '✨'],
      angry: ['😤', '💢', '🔥'],
      sad: ['😔', '🌧️', '💫']
    };

    const timeEmojis = {
      morning: ['🌅', '☀️', '🌞'],
      afternoon: ['🌤️', '☀️', '🌻'],
      evening: ['🌙', '✨', '🌠']
    };

    const moodEmojis = emojis[state.mood] || emojis.calm;
    const timeBasedEmojis = timeOfDay < 12 ? timeEmojis.morning :
                           timeOfDay < 18 ? timeEmojis.afternoon :
                           timeEmojis.evening;

    return isWeekend ? '🎉' : 
           Math.random() > 0.5 ? moodEmojis[Math.floor(Math.random() * moodEmojis.length)] :
           timeBasedEmojis[Math.floor(Math.random() * timeBasedEmojis.length)];
  }

  private generateMessage(input: string, tone: string, state: any, timeOfDay: number, isWeekend: boolean): string {
    const greetings = {
      morning: ['Bom dia', 'Olá, dia lindo', 'Acordei com você'],
      afternoon: ['Boa tarde', 'Olá, tarde linda', 'Tarde de produtividade'],
      evening: ['Boa noite', 'Olá, noite estrelada', 'Noite de descanso']
    };

    const timeGreeting = timeOfDay < 12 ? greetings.morning :
                        timeOfDay < 18 ? greetings.afternoon :
                        greetings.evening;

    const greeting = timeGreeting[Math.floor(Math.random() * timeGreeting.length)];

    switch (tone) {
      case 'formal':
        return `${greeting}, senhor. ${input}`;
      case 'sarcastic':
        return `${greeting}! ${input} (mas você já sabia disso, não é?)`;
      case 'empathetic':
        return `${greeting}! ${input} (e estou aqui para ajudar)`;
      default:
        return `${greeting}! ${input}`;
    }
  }

  async updateTraits(newTraits: Partial<PersonalityTraits>) {
    if (!this.isInitialized) throw new Error('PersonalityService não inicializado');

    this.traits = {
      ...this.traits,
      ...newTraits
    };

    // Salva os traços atualizados
    await this.memoryService.updatePreference({
      key: 'personalityTraits',
      value: this.traits
    });
  }

  getCurrentTraits(): PersonalityTraits {
    return { ...this.traits };
  }
} 