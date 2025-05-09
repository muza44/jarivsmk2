import { supabase } from './supabase';
import { MemoryService } from './memory-service';
import { DailySummaryService } from './daily-summary-service';
import { EmotionalFeedbackService } from './emotional-feedback-service';
import { PersonalityService } from './personality-service';

interface Device {
  id: string;
  name: string;
  type: 'light' | 'switch' | 'sensor' | 'camera' | 'thermostat';
  status: 'online' | 'offline';
  state: any;
  location: string;
}

interface Automation {
  id: string;
  name: string;
  trigger: {
    type: 'time' | 'device' | 'condition';
    value: any;
  };
  actions: {
    deviceId: string;
    action: string;
    params: any;
  }[];
  enabled: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: 'time' | 'event' | 'condition';
    value: any;
  };
  action: {
    type: string;
    params: any;
  };
  enabled: boolean;
}

interface AutomationResult {
  success: boolean;
  message: string;
  data?: any;
}

export class AutomationService {
  private static instance: AutomationService;
  private memoryService: MemoryService;
  private summaryService: DailySummaryService;
  private emotionalService: EmotionalFeedbackService;
  private personalityService: PersonalityService;
  private isInitialized: boolean = false;
  private devices: Map<string, Device> = new Map();
  private automations: Map<string, Automation> = new Map();
  private rules: AutomationRule[] = [];

  private constructor() {
    this.memoryService = MemoryService.getInstance();
    this.summaryService = DailySummaryService.getInstance();
    this.emotionalService = EmotionalFeedbackService.getInstance();
    this.personalityService = PersonalityService.getInstance();
  }

  static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    await this.memoryService.initialize();
    await this.summaryService.initialize();
    await this.emotionalService.initialize();
    await this.personalityService.initialize();
    
    // Carrega regras salvas
    await this.loadRules();
    
    // Inicia o monitoramento
    this.startMonitoring();

    // Carrega dispositivos do banco de dados
    const { data: devices } = await supabase
      .from('devices')
      .select('*');

    if (devices) {
      devices.forEach(device => {
        this.devices.set(device.id, device);
      });
    }

    // Carrega automações do banco de dados
    const { data: automations } = await supabase
      .from('automations')
      .select('*');

    if (automations) {
      automations.forEach(automation => {
        this.automations.set(automation.id, automation);
      });
    }

    // Registra o uso do serviço de automação
    await this.memoryService.recordUsagePattern('automation_service', {
      initialized: true,
      deviceCount: this.devices.size,
      automationCount: this.automations.size,
      timestamp: new Date().toISOString()
    });

    this.isInitialized = true;
  }

  private async loadRules() {
    try {
      const { data: savedRules } = await this.memoryService.getPreferences();
      if (savedRules?.automationRules) {
        this.rules = savedRules.automationRules;
      } else {
        // Regras padrão
        this.rules = [
          {
            id: 'morning-summary',
            name: 'Resumo Matinal',
            trigger: {
              type: 'time',
              value: { hour: 8, minute: 0 }
            },
            action: {
              type: 'generateDailySummary',
              params: {}
            },
            enabled: true
          },
          {
            id: 'evening-check',
            name: 'Verificação Noturna',
            trigger: {
              type: 'time',
              value: { hour: 22, minute: 0 }
            },
            action: {
              type: 'checkEveningTasks',
              params: {}
            },
            enabled: true
          },
          {
            id: 'stress-alert',
            name: 'Alerta de Estresse',
            trigger: {
              type: 'condition',
              value: { metric: 'stress', threshold: 70 }
            },
            action: {
              type: 'suggestBreak',
              params: {}
            },
            enabled: true
          }
        ];
      }
    } catch (error) {
      console.error('Erro ao carregar regras de automação:', error);
    }
  }

  private startMonitoring() {
    // Monitora o tempo
    setInterval(() => {
      const now = new Date();
      this.checkTimeBasedRules(now);
    }, 60000); // Verifica a cada minuto

    // Monitora condições
    setInterval(() => {
      this.checkConditionBasedRules();
    }, 300000); // Verifica a cada 5 minutos
  }

  private async checkTimeBasedRules(now: Date) {
    const hour = now.getHours();
    const minute = now.getMinutes();

    for (const rule of this.rules) {
      if (rule.enabled && rule.trigger.type === 'time') {
        const triggerTime = rule.trigger.value;
        if (triggerTime.hour === hour && triggerTime.minute === minute) {
          await this.executeRule(rule);
        }
      }
    }
  }

  private async checkConditionBasedRules() {
    const emotionalState = this.emotionalService.getCurrentState();

    for (const rule of this.rules) {
      if (rule.enabled && rule.trigger.type === 'condition') {
        const condition = rule.trigger.value;
        if (condition.metric === 'stress' && emotionalState.stress > condition.threshold) {
          await this.executeRule(rule);
        }
      }
    }
  }

  private async executeRule(rule: AutomationRule): Promise<AutomationResult> {
    try {
      switch (rule.action.type) {
        case 'generateDailySummary':
          const summary = await this.summaryService.generateDailySummary();
          const formattedSummary = await this.summaryService.formatSummaryAsText(summary);
          const response = await this.personalityService.generateResponse(formattedSummary);
          return {
            success: true,
            message: response.message,
            data: { summary, response }
          };

        case 'checkEveningTasks':
          const tasks = await this.summaryService.getTasks();
          const pendingTasks = tasks.filter(task => !task.completed);
          const response = await this.personalityService.generateResponse(
            `Você tem ${pendingTasks.length} tarefas pendentes para hoje.`
          );
          return {
            success: true,
            message: response.message,
            data: { tasks: pendingTasks, response }
          };

        case 'suggestBreak':
          const suggestions = [
            'Que tal fazer uma pausa?',
            'Respire fundo e relaxe um pouco',
            'Tome um copo d\'água e alongue-se'
          ];
          const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
          const response = await this.personalityService.generateResponse(suggestion);
          return {
            success: true,
            message: response.message,
            data: { suggestion, response }
          };

        default:
          return {
            success: false,
            message: `Ação desconhecida: ${rule.action.type}`
          };
      }
    } catch (error) {
      console.error('Erro ao executar regra:', error);
      return {
        success: false,
        message: 'Erro ao executar regra de automação'
      };
    }
  }

  // Gerenciamento de Dispositivos
  async addDevice(device: Omit<Device, 'id'>): Promise<Device> {
    if (!this.isInitialized) throw new Error('AutomationService não inicializado');

    const { data, error } = await supabase
      .from('devices')
      .insert([device])
      .select()
      .single();

    if (error) throw error;

    this.devices.set(data.id, data);
    await this.memoryService.recordInteraction('device_added', {
      deviceId: data.id,
      deviceName: data.name,
      deviceType: data.type
    });

    return data;
  }

  async updateDeviceState(deviceId: string, state: any): Promise<void> {
    if (!this.isInitialized) throw new Error('AutomationService não inicializado');

    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Dispositivo não encontrado');

    const { error } = await supabase
      .from('devices')
      .update({ state })
      .eq('id', deviceId);

    if (error) throw error;

    device.state = state;
    this.devices.set(deviceId, device);

    await this.memoryService.recordInteraction('device_state_updated', {
      deviceId,
      deviceName: device.name,
      newState: state
    });

    // Verifica automações que podem ser acionadas
    await this.checkAutomations(deviceId, state);
  }

  // Gerenciamento de Automações
  async createAutomation(automation: Omit<Automation, 'id'>): Promise<Automation> {
    if (!this.isInitialized) throw new Error('AutomationService não inicializado');

    const { data, error } = await supabase
      .from('automations')
      .insert([automation])
      .select()
      .single();

    if (error) throw error;

    this.automations.set(data.id, data);
    await this.memoryService.recordInteraction('automation_created', {
      automationId: data.id,
      automationName: data.name,
      triggerType: data.trigger.type
    });

    return data;
  }

  async toggleAutomation(automationId: string, enabled: boolean): Promise<void> {
    if (!this.isInitialized) throw new Error('AutomationService não inicializado');

    const automation = this.automations.get(automationId);
    if (!automation) throw new Error('Automação não encontrada');

    const { error } = await supabase
      .from('automations')
      .update({ enabled })
      .eq('id', automationId);

    if (error) throw error;

    automation.enabled = enabled;
    this.automations.set(automationId, automation);

    await this.memoryService.recordInteraction('automation_toggled', {
      automationId,
      automationName: automation.name,
      enabled
    });
  }

  // Verificação de Automações
  private async checkAutomations(deviceId: string, state: any): Promise<void> {
    for (const automation of this.automations.values()) {
      if (!automation.enabled) continue;

      if (automation.trigger.type === 'device' && 
          automation.trigger.value.deviceId === deviceId &&
          this.checkTriggerCondition(automation.trigger.value, state)) {
        await this.executeAutomation(automation);
      }
    }
  }

  private checkTriggerCondition(trigger: any, state: any): boolean {
    // Implementar lógica de verificação de condições
    // Por exemplo: verificar se temperatura > 25°C
    return true;
  }

  private async executeAutomation(automation: Automation): Promise<void> {
    for (const action of automation.actions) {
      const device = this.devices.get(action.deviceId);
      if (!device) continue;

      // Executa a ação no dispositivo
      await this.executeDeviceAction(device, action.action, action.params);
    }

    await this.memoryService.recordInteraction('automation_executed', {
      automationId: automation.id,
      automationName: automation.name
    });
  }

  private async executeDeviceAction(device: Device, action: string, params: any): Promise<void> {
    // Implementar lógica de execução de ações específicas para cada tipo de dispositivo
    // Por exemplo: ligar/desligar luz, ajustar termostato, etc.
    console.log(`Executando ação ${action} no dispositivo ${device.name}`, params);
  }

  // Métodos de Consulta
  getDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  getAutomations(): Automation[] {
    return Array.from(this.automations.values());
  }

  getDeviceById(id: string): Device | undefined {
    return this.devices.get(id);
  }

  getAutomationById(id: string): Automation | undefined {
    return this.automations.get(id);
  }

  async addRule(rule: Omit<AutomationRule, 'id'>): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule_${Date.now()}`
    };

    this.rules.push(newRule);
    await this.saveRules();

    return newRule;
  }

  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule | null> {
    const index = this.rules.findIndex(rule => rule.id === id);
    if (index === -1) return null;

    this.rules[index] = {
      ...this.rules[index],
      ...updates
    };

    await this.saveRules();
    return this.rules[index];
  }

  async deleteRule(id: string): Promise<boolean> {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(rule => rule.id !== id);
    
    if (this.rules.length !== initialLength) {
      await this.saveRules();
      return true;
    }
    
    return false;
  }

  private async saveRules() {
    await this.memoryService.updatePreference({
      key: 'automationRules',
      value: this.rules
    });
  }

  getRules(): AutomationRule[] {
    return [...this.rules];
  }
} 