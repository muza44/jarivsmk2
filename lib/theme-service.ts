import { MemoryService } from './memory-service';
import { supabase } from '../lib/supabase';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

interface ThemeConfig {
  colors: ThemeColors;
  mood: 'happy' | 'calm' | 'energetic' | 'focused';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  animationSpeed: string;
}

export class ThemeService {
  private static instance: ThemeService;
  private memoryService: MemoryService;
  private currentTheme: ThemeConfig;
  private isInitialized: boolean = false;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
    this.currentTheme = this.getDefaultTheme();
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    await this.memoryService.initialize();
    
    // Carrega tema salvo ou usa o padrão
    const savedTheme = await this.loadSavedTheme();
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }

    this.isInitialized = true;
  }

  private getDefaultTheme(): ThemeConfig {
    return {
      colors: {
        primary: '#4A90E2',
        secondary: '#50E3C2',
        background: '#1A1A1A',
        text: '#FFFFFF',
        accent: '#F5A623'
      },
      mood: 'calm',
      soundEnabled: true,
      animationsEnabled: true,
      animationSpeed: 'slow'
    };
  }

  private async loadSavedTheme(): Promise<ThemeConfig | null> {
    try {
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', this.memoryService.getUserId())
        .single();

      return existingPrefs?.preferences?.theme as ThemeConfig || null;
    } catch {
      return null;
    }
  }

  async updateTheme(newTheme: Partial<ThemeConfig>) {
    if (!this.isInitialized) throw new Error('ThemeService não inicializado');

    this.currentTheme = {
      ...this.currentTheme,
      ...newTheme,
      colors: {
        ...this.currentTheme.colors,
        ...(newTheme.colors || {})
      }
    };

    // Salva o tema atualizado
    await this.memoryService.updatePreference({
      key: 'theme',
      value: this.currentTheme
    });

    // Aplica o tema
    this.applyTheme();
  }

  private applyTheme() {
    const root = document.documentElement;
    const { colors } = this.currentTheme;

    // Aplica cores
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-accent', colors.accent);

    // Aplica classes de humor
    root.classList.remove('mood-happy', 'mood-calm', 'mood-energetic', 'mood-focused');
    root.classList.add(`mood-${this.currentTheme.mood}`);

    // Aplica configurações de som e animação
    root.classList.toggle('sound-enabled', this.currentTheme.soundEnabled);
    root.classList.toggle('animations-enabled', this.currentTheme.animationsEnabled);

    // Aplica velocidade de animação
    root.style.setProperty('--animation-speed', this.currentTheme.animationSpeed);
  }

  async updateThemeBasedOnTime() {
    const hour = new Date().getHours();
    let mood: ThemeConfig['mood'];
    let colors: ThemeColors;

    if (hour >= 5 && hour < 12) {
      // Manhã - Energético e motivador
      mood = 'energetic';
      colors = {
        primary: '#4A90E2',
        secondary: '#F5A623',
        background: '#E6F3FF',
        text: '#2C3E50',
        accent: '#FF6B6B'
      };
    } else if (hour >= 12 && hour < 18) {
      // Tarde - Focado e produtivo
      mood = 'focused';
      colors = {
        primary: '#50E3C2',
        secondary: '#9013FE',
        background: '#F0FFF4',
        text: '#2C3E50',
        accent: '#4A90E2'
      };
    } else {
      // Noite - Calmo e relaxante
      mood = 'calm';
      colors = {
        primary: '#9013FE',
        secondary: '#4A90E2',
        background: '#F5F7FA',
        text: '#2C3E50',
        accent: '#50E3C2'
      };
    }

    await this.updateTheme({ 
      mood, 
      colors,
      soundEnabled: mood !== 'focused',
      animationsEnabled: mood !== 'focused',
      animationSpeed: mood === 'calm' ? 'slow' : 'fast'
    });
  }

  async updateThemeBasedOnMood(userMood: 'happy' | 'calm' | 'energetic' | 'focused') {
    const colorSchemes: Record<ThemeConfig['mood'], Partial<ThemeColors>> = {
      happy: {
        primary: '#F5A623',
        secondary: '#50E3C2',
        background: '#FFF9E6',
        text: '#2C3E50',
        accent: '#FF6B6B'
      },
      calm: {
        primary: '#9013FE',
        secondary: '#4A90E2',
        background: '#F5F7FA',
        text: '#2C3E50',
        accent: '#50E3C2'
      },
      energetic: {
        primary: '#4A90E2',
        secondary: '#F5A623',
        background: '#E6F3FF',
        text: '#2C3E50',
        accent: '#FF6B6B'
      },
      focused: {
        primary: '#50E3C2',
        secondary: '#9013FE',
        background: '#F0FFF4',
        text: '#2C3E50',
        accent: '#4A90E2'
      }
    };

    const transitions = {
      happy: {
        soundEnabled: true,
        animationsEnabled: true,
        animationSpeed: 'fast'
      },
      calm: {
        soundEnabled: false,
        animationsEnabled: true,
        animationSpeed: 'slow'
      },
      energetic: {
        soundEnabled: true,
        animationsEnabled: true,
        animationSpeed: 'fast'
      },
      focused: {
        soundEnabled: false,
        animationsEnabled: false,
        animationSpeed: 'none'
      }
    };

    await this.updateTheme({
      mood: userMood,
      colors: {
        ...this.currentTheme.colors,
        ...colorSchemes[userMood]
      },
      ...transitions[userMood]
    });

    // Aplica classes específicas de humor
    const root = document.documentElement;
    root.classList.remove('mood-happy', 'mood-calm', 'mood-energetic', 'mood-focused');
    root.classList.add(`mood-${userMood}`);
    root.style.setProperty('--animation-speed', transitions[userMood].animationSpeed);
  }

  getCurrentTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }

  async toggleSound() {
    await this.updateTheme({
      soundEnabled: !this.currentTheme.soundEnabled
    });
  }

  async toggleAnimations() {
    await this.updateTheme({
      animationsEnabled: !this.currentTheme.animationsEnabled
    });
  }
} 