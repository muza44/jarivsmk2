import { supabase } from './supabase';

export type InteractionType = 
  | 'chat_message'
  | 'command_execution'
  | 'voice_command'
  | 'preference_update'
  | 'feature_usage';

interface Interaction {
  type: InteractionType;
  content: any;
  metadata?: Record<string, any>;
}

interface UserPreference {
  key: string;
  value: any;
}

export class MemoryService {
  private static instance: MemoryService;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  async initialize() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  getUserId(): string | null {
    return this.userId;
  }

  // Registra uma interação do usuário
  async recordInteraction(interaction: Interaction) {
    if (!this.userId) throw new Error('MemoryService não inicializado');

    const { data, error } = await supabase
      .from('user_interactions')
      .insert({
        user_id: this.userId,
        interaction_type: interaction.type,
        content: interaction.content,
        metadata: interaction.metadata,
      });

    if (error) throw error;
    return data;
  }

  // Atualiza ou cria uma preferência do usuário
  async updatePreference(preference: UserPreference) {
    if (!this.userId) throw new Error('MemoryService não inicializado');

    const { data: existingPrefs } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', this.userId)
      .single();

    const currentPrefs = existingPrefs?.preferences || {};
    const updatedPrefs = { ...currentPrefs, [preference.key]: preference.value };

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: this.userId,
        preferences: updatedPrefs,
      });

    if (error) throw error;
    return data;
  }

  // Registra um padrão de uso
  async recordUsagePattern(patternType: string, metadata?: Record<string, any>) {
    if (!this.userId) throw new Error('MemoryService não inicializado');

    const { data: existingPattern } = await supabase
      .from('usage_patterns')
      .select('*')
      .eq('user_id', this.userId)
      .eq('pattern_type', patternType)
      .single();

    if (existingPattern) {
      const { data, error } = await supabase
        .from('usage_patterns')
        .update({
          frequency: existingPattern.frequency + 1,
          last_used: new Date().toISOString(),
          metadata: { ...existingPattern.metadata, ...metadata },
        })
        .eq('id', existingPattern.id);

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('usage_patterns')
        .insert({
          user_id: this.userId,
          pattern_type: patternType,
          metadata,
        });

      if (error) throw error;
      return data;
    }
  }

  // Obtém sugestões baseadas no histórico do usuário
  async getSuggestions(): Promise<string[]> {
    if (!this.userId) throw new Error('MemoryService não inicializado');

    // Busca padrões de uso frequentes
    const { data: patterns } = await supabase
      .from('usage_patterns')
      .select('*')
      .eq('user_id', this.userId)
      .order('frequency', { ascending: false })
      .limit(5);

    // Busca interações recentes
    const { data: recentInteractions } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Gera sugestões baseadas nos padrões e interações
    const suggestions: string[] = [];

    if (patterns) {
      patterns.forEach(pattern => {
        switch (pattern.pattern_type) {
          case 'command_execution':
            suggestions.push(`Você costuma executar o comando "${pattern.metadata?.command}" frequentemente.`);
            break;
          case 'feature_usage':
            suggestions.push(`Você usa frequentemente a funcionalidade "${pattern.metadata?.feature}".`);
            break;
        }
      });
    }

    if (recentInteractions) {
      const timeBasedSuggestions = this.generateTimeBasedSuggestions(recentInteractions);
      suggestions.push(...timeBasedSuggestions);
    }

    return suggestions;
  }

  // Gera sugestões baseadas no horário das interações
  private generateTimeBasedSuggestions(interactions: any[]): string[] {
    const suggestions: string[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Sugestões baseadas no horário do dia
    if (hour >= 8 && hour < 12) {
      suggestions.push('Bom dia! Que tal verificar suas tarefas do dia?');
    } else if (hour >= 12 && hour < 18) {
      suggestions.push('Boa tarde! Precisa de ajuda com algo?');
    } else {
      suggestions.push('Boa noite! Vamos revisar o dia?');
    }

    // Sugestões baseadas em padrões de uso
    const weekday = now.getDay();
    const isWeekend = weekday === 0 || weekday === 6;

    if (isWeekend) {
      suggestions.push('É fim de semana! Que tal verificar o clima para seus planos?');
    } else {
      suggestions.push('Dia de semana! Vamos verificar sua agenda?');
    }

    return suggestions;
  }
} 