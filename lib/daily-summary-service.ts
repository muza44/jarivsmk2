import { MemoryService } from './memory-service';
import { supabase } from './supabase';

interface DailySummary {
  date: string;
  weather: {
    temperature: number;
    condition: string;
    location: string;
  };
  appointments: Array<{
    title: string;
    time: string;
    location?: string;
  }>;
  tasks: Array<{
    title: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
  }>;
  notifications: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export class DailySummaryService {
  private static instance: DailySummaryService;
  private memoryService: MemoryService;
  private isInitialized: boolean = false;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
  }

  static getInstance(): DailySummaryService {
    if (!DailySummaryService.instance) {
      DailySummaryService.instance = new DailySummaryService();
    }
    return DailySummaryService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    await this.memoryService.initialize();
    this.isInitialized = true;
  }

  async generateDailySummary(): Promise<DailySummary> {
    if (!this.isInitialized) throw new Error('DailySummaryService não inicializado');

    try {
      // Busca dados do clima
      const weather = await this.getWeatherData();

      // Busca compromissos
      const appointments = await this.getAppointments();

      // Busca tarefas
      const tasks = await this.getTasks();

      // Busca notificações
      const notifications = await this.getNotifications();

      const summary: DailySummary = {
        date: new Date().toISOString().split('T')[0],
        weather,
        appointments,
        tasks,
        notifications
      };

      // Registra a geração do resumo
      await this.memoryService.recordInteraction({
        type: 'feature_usage',
        content: 'daily_summary',
        metadata: { summary }
      });

      return summary;
    } catch (error) {
      console.error('Erro ao gerar resumo diário:', error);
      throw error;
    }
  }

  async getRecentSummaries(): Promise<DailySummary[]> {
    if (!this.isInitialized) throw new Error('DailySummaryService não inicializado');

    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', this.memoryService.getUserId())
      .eq('interaction_type', 'feature_usage')
      .eq('content', 'daily_summary')
      .order('created_at', { ascending: false })
      .limit(10);

    return interactions?.map((interaction: any) => interaction.metadata.summary as DailySummary) || [];
  }

  private async getWeatherData() {
    // Implementar integração com API de clima
    return {
      temperature: 25,
      condition: 'Ensolarado',
      location: 'São Paulo'
    };
  }

  private async getAppointments() {
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .gte('time', new Date().toISOString())
      .order('time', { ascending: true });

    return appointments?.map(apt => ({
      title: apt.title,
      time: apt.time,
      location: apt.location
    })) || [];
  }

  private async getTasks() {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', new Date().toISOString().split('T')[0])
      .order('priority', { ascending: false });

    return tasks?.map(task => ({
      title: task.title,
      completed: task.completed,
      priority: task.priority
    })) || [];
  }

  private async getNotifications() {
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .gte('timestamp', new Date().toISOString().split('T')[0])
      .order('timestamp', { ascending: false });

    return notifications?.map(notif => ({
      type: notif.type,
      message: notif.message,
      timestamp: notif.timestamp
    })) || [];
  }

  async formatSummaryAsText(summary: DailySummary): Promise<string> {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    let text = `${greeting}! Aqui está seu resumo do dia:\n\n`;

    // Adiciona informações do clima
    text += `🌤️ Clima em ${summary.weather.location}: ${summary.weather.temperature}°C, ${summary.weather.condition}\n\n`;

    // Adiciona compromissos
    if (summary.appointments.length > 0) {
      text += '📅 Compromissos do dia:\n';
      summary.appointments.forEach(apt => {
        text += `- ${apt.title} às ${apt.time}${apt.location ? ` em ${apt.location}` : ''}\n`;
      });
      text += '\n';
    }

    // Adiciona tarefas
    if (summary.tasks.length > 0) {
      text += '📝 Tarefas:\n';
      summary.tasks.forEach(task => {
        const status = task.completed ? '✅' : '⭕';
        text += `${status} ${task.title}\n`;
      });
      text += '\n';
    }

    // Adiciona notificações importantes
    const importantNotifications = summary.notifications.filter(n => n.type === 'important');
    if (importantNotifications.length > 0) {
      text += '🔔 Notificações importantes:\n';
      importantNotifications.forEach(notif => {
        text += `- ${notif.message}\n`;
      });
    }

    return text;
  }
} 