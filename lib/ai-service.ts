import { supabase } from './supabase';
import { MemoryService } from './memory-service';
import { AutomationService } from './automation-service';

interface Prediction {
  id: string;
  type: 'behavior' | 'preference' | 'schedule' | 'environment';
  confidence: number;
  data: any;
  timestamp: Date;
}

interface AIContext {
  userPreferences: any;
  recentInteractions: any[];
  environmentalData: any;
  scheduleData: any;
}

export class AIService {
  private static instance: AIService;
  private memoryService: MemoryService;
  private automationService: AutomationService;
  private isInitialized: boolean = false;
  private predictions: Map<string, Prediction> = new Map();
  private context: AIContext = {
    userPreferences: {},
    recentInteractions: [],
    environmentalData: {},
    scheduleData: {}
  };

  private constructor() {
    this.memoryService = MemoryService.getInstance();
    this.automationService = AutomationService.getInstance();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Inicializa serviços dependentes
    await this.memoryService.initialize();
    await this.automationService.initialize();

    // Carrega contexto inicial
    await this.loadContext();

    // Inicia análise preditiva
    this.startPredictiveAnalysis();

    this.isInitialized = true;
  }

  private async loadContext() {
    // Carrega preferências do usuário
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .single();
    
    if (preferences) {
      this.context.userPreferences = preferences;
    }

    // Carrega interações recentes
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (interactions) {
      this.context.recentInteractions = interactions;
    }

    // Carrega dados ambientais
    const { data: environmental } = await supabase
      .from('environmental_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(24);

    if (environmental) {
      this.context.environmentalData = environmental;
    }

    // Carrega dados de agenda
    const { data: schedule } = await supabase
      .from('schedule_data')
      .select('*')
      .order('timestamp', { ascending: true });

    if (schedule) {
      this.context.scheduleData = schedule;
    }
  }

  private startPredictiveAnalysis() {
    // Inicia análise em background
    setInterval(async () => {
      await this.analyzeBehavior();
      await this.predictPreferences();
      await this.analyzeSchedule();
      await this.analyzeEnvironment();
    }, 5 * 60 * 1000); // A cada 5 minutos
  }

  private async analyzeBehavior() {
    try {
      // Analisa padrões de comportamento
      const patterns = await this.findBehaviorPatterns();
      
      // Gera predições baseadas nos padrões
      const predictions = await this.generatePredictions('behavior', patterns);
      
      // Salva predições
      await this.savePredictions(predictions);
      
      // Atualiza automações baseadas nas predições
      await this.updateAutomations(predictions);
    } catch (error) {
      console.error('Erro na análise de comportamento:', error);
    }
  }

  private async findBehaviorPatterns() {
    // Implementa análise de padrões usando os dados do contexto
    const patterns = {
      timeBased: this.analyzeTimePatterns(),
      interactionBased: this.analyzeInteractionPatterns(),
      preferenceBased: this.analyzePreferencePatterns()
    };

    return patterns;
  }

  private analyzeTimePatterns() {
    // Analisa padrões baseados em horários
    const timePatterns = {
      activeHours: this.findActiveHours(),
      routineTimes: this.findRoutineTimes(),
      breakTimes: this.findBreakTimes()
    };

    return timePatterns;
  }

  private findActiveHours() {
    // Implementa lógica para encontrar horários mais ativos
    return {
      start: '08:00',
      end: '18:00',
      confidence: 0.85
    };
  }

  private findRoutineTimes() {
    // Implementa lógica para encontrar horários de rotina
    return [
      { time: '08:00', activity: 'start_work', confidence: 0.9 },
      { time: '12:00', activity: 'lunch', confidence: 0.85 },
      { time: '18:00', activity: 'end_work', confidence: 0.9 }
    ];
  }

  private findBreakTimes() {
    // Implementa lógica para encontrar horários de pausa
    return [
      { time: '10:30', duration: 15, confidence: 0.8 },
      { time: '15:30', duration: 15, confidence: 0.8 }
    ];
  }

  private analyzeInteractionPatterns() {
    // Analisa padrões de interação
    return {
      frequentCommands: this.findFrequentCommands(),
      commonSequences: this.findCommonSequences(),
      preferredDevices: this.findPreferredDevices()
    };
  }

  private findFrequentCommands() {
    // Implementa lógica para encontrar comandos frequentes
    return [
      { command: 'turn_on_lights', frequency: 0.8 },
      { command: 'check_weather', frequency: 0.6 },
      { command: 'play_music', frequency: 0.4 }
    ];
  }

  private findCommonSequences() {
    // Implementa lógica para encontrar sequências comuns
    return [
      { sequence: ['wake_up', 'turn_on_lights', 'check_weather'], frequency: 0.7 },
      { sequence: ['end_work', 'turn_off_lights', 'play_music'], frequency: 0.6 }
    ];
  }

  private findPreferredDevices() {
    // Implementa lógica para encontrar dispositivos preferidos
    return [
      { device: 'living_room_lights', usage: 0.9 },
      { device: 'thermostat', usage: 0.7 },
      { device: 'speakers', usage: 0.5 }
    ];
  }

  private analyzePreferencePatterns() {
    // Analisa padrões de preferência
    return {
      temperature: this.findTemperaturePreferences(),
      lighting: this.findLightingPreferences(),
      music: this.findMusicPreferences()
    };
  }

  private findTemperaturePreferences() {
    // Implementa lógica para encontrar preferências de temperatura
    return {
      day: 22,
      night: 20,
      confidence: 0.85
    };
  }

  private findLightingPreferences() {
    // Implementa lógica para encontrar preferências de iluminação
    return {
      day: { brightness: 80, color: 'white' },
      night: { brightness: 30, color: 'warm' },
      confidence: 0.8
    };
  }

  private findMusicPreferences() {
    // Implementa lógica para encontrar preferências musicais
    return {
      genres: ['electronic', 'ambient', 'classical'],
      volume: 0.7,
      confidence: 0.75
    };
  }

  private async generatePredictions(type: string, data: any): Promise<Prediction[]> {
    // Gera predições baseadas nos dados analisados
    const predictions: Prediction[] = [];

    switch (type) {
      case 'behavior':
        predictions.push({
          id: crypto.randomUUID(),
          type: 'behavior',
          confidence: 0.85,
          data: {
            nextAction: this.predictNextAction(),
            expectedTime: this.predictExpectedTime(),
            context: this.predictContext()
          },
          timestamp: new Date()
        });
        break;

      case 'preference':
        predictions.push({
          id: crypto.randomUUID(),
          type: 'preference',
          confidence: 0.8,
          data: {
            temperature: this.predictTemperaturePreference(),
            lighting: this.predictLightingPreference(),
            music: this.predictMusicPreference()
          },
          timestamp: new Date()
        });
        break;

      case 'schedule':
        predictions.push({
          id: crypto.randomUUID(),
          type: 'schedule',
          confidence: 0.9,
          data: {
            nextEvent: this.predictNextEvent(),
            scheduleChanges: this.predictScheduleChanges(),
            conflicts: this.predictScheduleConflicts()
          },
          timestamp: new Date()
        });
        break;

      case 'environment':
        predictions.push({
          id: crypto.randomUUID(),
          type: 'environment',
          confidence: 0.75,
          data: {
            temperature: this.predictEnvironmentTemperature(),
            lighting: this.predictEnvironmentLighting(),
            noise: this.predictEnvironmentNoise()
          },
          timestamp: new Date()
        });
        break;
    }

    return predictions;
  }

  private predictNextAction(): any {
    // Implementa lógica para prever próxima ação
    return {
      action: 'turn_on_lights',
      time: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos no futuro
      confidence: 0.85
    };
  }

  private predictExpectedTime(): any {
    // Implementa lógica para prever tempo esperado
    return {
      duration: 45, // minutos
      confidence: 0.8
    };
  }

  private predictContext(): any {
    // Implementa lógica para prever contexto
    return {
      location: 'home',
      activity: 'working',
      timeOfDay: 'morning',
      confidence: 0.9
    };
  }

  private predictTemperaturePreference(): any {
    // Implementa lógica para prever preferência de temperatura
    return {
      value: 22,
      range: { min: 20, max: 24 },
      confidence: 0.85
    };
  }

  private predictLightingPreference(): any {
    // Implementa lógica para prever preferência de iluminação
    return {
      brightness: 80,
      color: 'white',
      confidence: 0.8
    };
  }

  private predictMusicPreference(): any {
    // Implementa lógica para prever preferência musical
    return {
      genre: 'electronic',
      volume: 0.7,
      confidence: 0.75
    };
  }

  private predictNextEvent(): any {
    // Implementa lógica para prever próximo evento
    return {
      event: 'meeting',
      time: new Date(Date.now() + 60 * 60 * 1000), // 1 hora no futuro
      duration: 30,
      confidence: 0.9
    };
  }

  private predictScheduleChanges(): any {
    // Implementa lógica para prever mudanças na agenda
    return {
      changes: [
        {
          type: 'reschedule',
          event: 'meeting',
          newTime: new Date(Date.now() + 90 * 60 * 1000),
          confidence: 0.8
        }
      ]
    };
  }

  private predictScheduleConflicts(): any {
    // Implementa lógica para prever conflitos na agenda
    return {
      conflicts: [
        {
          events: ['meeting', 'lunch'],
          time: new Date(Date.now() + 120 * 60 * 1000),
          confidence: 0.85
        }
      ]
    };
  }

  private predictEnvironmentTemperature(): any {
    // Implementa lógica para prever temperatura ambiente
    return {
      value: 23,
      trend: 'increasing',
      confidence: 0.8
    };
  }

  private predictEnvironmentLighting(): any {
    // Implementa lógica para prever iluminação ambiente
    return {
      level: 'bright',
      natural: true,
      confidence: 0.75
    };
  }

  private predictEnvironmentNoise(): any {
    // Implementa lógica para prever nível de ruído
    return {
      level: 'low',
      source: 'none',
      confidence: 0.7
    };
  }

  private async savePredictions(predictions: Prediction[]) {
    // Salva predições no banco de dados
    const { error } = await supabase
      .from('predictions')
      .insert(predictions);

    if (error) {
      console.error('Erro ao salvar predições:', error);
      return;
    }

    // Atualiza cache local
    predictions.forEach(prediction => {
      this.predictions.set(prediction.id, prediction);
    });
  }

  private async updateAutomations(predictions: Prediction[]) {
    // Atualiza automações baseadas nas predições
    for (const prediction of predictions) {
      if (prediction.confidence < 0.7) continue; // Ignora predições com baixa confiança

      switch (prediction.type) {
        case 'behavior':
          await this.updateBehaviorAutomations(prediction);
          break;
        case 'preference':
          await this.updatePreferenceAutomations(prediction);
          break;
        case 'schedule':
          await this.updateScheduleAutomations(prediction);
          break;
        case 'environment':
          await this.updateEnvironmentAutomations(prediction);
          break;
      }
    }
  }

  private async updateBehaviorAutomations(prediction: Prediction) {
    // Atualiza automações baseadas em comportamento
    const { data: nextAction } = prediction.data;
    
    // Cria ou atualiza automação para a próxima ação prevista
    await this.automationService.createAutomation({
      name: `Auto-${nextAction.action}`,
      trigger: {
        type: 'time',
        value: nextAction.time
      },
      actions: [
        {
          deviceId: this.getDeviceIdForAction(nextAction.action),
          action: nextAction.action,
          params: this.getParamsForAction(nextAction.action)
        }
      ],
      enabled: true
    });
  }

  private async updatePreferenceAutomations(prediction: Prediction) {
    // Atualiza automações baseadas em preferências
    const { temperature, lighting, music } = prediction.data;
    
    // Atualiza configurações de dispositivos
    if (temperature) {
      await this.automationService.updateDeviceState(
        this.getDeviceIdForAction('set_temperature'),
        { temperature: temperature.value }
      );
    }

    if (lighting) {
      await this.automationService.updateDeviceState(
        this.getDeviceIdForAction('set_lighting'),
        { brightness: lighting.brightness, color: lighting.color }
      );
    }

    if (music) {
      await this.automationService.updateDeviceState(
        this.getDeviceIdForAction('set_music'),
        { genre: music.genre, volume: music.volume }
      );
    }
  }

  private async updateScheduleAutomations(prediction: Prediction) {
    // Atualiza automações baseadas em agenda
    const { nextEvent, scheduleChanges, conflicts } = prediction.data;
    
    // Cria automações para eventos futuros
    if (nextEvent) {
      await this.automationService.createAutomation({
        name: `Auto-${nextEvent.event}`,
        trigger: {
          type: 'time',
          value: nextEvent.time
        },
        actions: this.getActionsForEvent(nextEvent)
      });
    }

    // Atualiza automações existentes para mudanças na agenda
    if (scheduleChanges) {
      for (const change of scheduleChanges.changes) {
        const automation = this.findAutomationForEvent(change.event);
        if (automation) {
          await this.automationService.updateAutomation(automation.id, {
            trigger: {
              type: 'time',
              value: change.newTime
            }
          });
        }
      }
    }
  }

  private async updateEnvironmentAutomations(prediction: Prediction) {
    // Atualiza automações baseadas em ambiente
    const { temperature, lighting, noise } = prediction.data;
    
    // Ajusta dispositivos baseado nas condições ambientais
    if (temperature) {
      await this.automationService.updateDeviceState(
        this.getDeviceIdForAction('set_temperature'),
        { temperature: temperature.value }
      );
    }

    if (lighting) {
      await this.automationService.updateDeviceState(
        this.getDeviceIdForAction('set_lighting'),
        { brightness: lighting.level === 'bright' ? 80 : 40 }
      );
    }

    if (noise) {
      await this.automationService.updateDeviceState(
        this.getDeviceIdForAction('set_noise'),
        { level: noise.level }
      );
    }
  }

  private getDeviceIdForAction(action: string): string {
    // Implementa lógica para encontrar ID do dispositivo para uma ação
    // Por enquanto, retorna um ID mock
    return 'device-1';
  }

  private getParamsForAction(action: string): any {
    // Implementa lógica para obter parâmetros para uma ação
    // Por enquanto, retorna parâmetros mock
    return {};
  }

  private getActionsForEvent(event: any): any[] {
    // Implementa lógica para obter ações para um evento
    // Por enquanto, retorna ações mock
    return [];
  }

  private findAutomationForEvent(event: string): any {
    // Implementa lógica para encontrar automação para um evento
    // Por enquanto, retorna automação mock
    return null;
  }

  // Métodos públicos
  async getPredictions(type?: string): Promise<Prediction[]> {
    if (!this.isInitialized) throw new Error('AIService não inicializado');

    if (type) {
      return Array.from(this.predictions.values())
        .filter(p => p.type === type);
    }

    return Array.from(this.predictions.values());
  }

  async getContext(): Promise<AIContext> {
    if (!this.isInitialized) throw new Error('AIService não inicializado');
    return this.context;
  }

  async updateContext(newContext: Partial<AIContext>): Promise<void> {
    if (!this.isInitialized) throw new Error('AIService não inicializado');

    this.context = {
      ...this.context,
      ...newContext
    };

    // Atualiza banco de dados
    if (newContext.userPreferences) {
      await supabase
        .from('user_preferences')
        .upsert(newContext.userPreferences);
    }

    // Reinicia análise com novo contexto
    await this.analyzeBehavior();
  }
} 