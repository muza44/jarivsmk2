import { useState, useEffect } from 'react';
import { DailySummaryService } from '../lib/daily-summary-service';

interface DailySummary {
  date: string;
  weather: {
    temperature: number;
    condition: string;
    location: string;
  };
  appointments: Array<{
    time: string;
    title: string;
    location?: string;
  }>;
  tasks: Array<{
    title: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
  }>;
  notifications: Array<{
    type: 'info' | 'warning' | 'success' | 'error';
    message: string;
  }>;
}

export default function DailySummaryHistory() {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      const summaryService = DailySummaryService.getInstance();
      await summaryService.initialize();
      const recentSummaries = await summaryService.getRecentSummaries();
      setSummaries(recentSummaries);
    } catch (error) {
      setError('Erro ao carregar histórico de resumos');
      console.error('Erro ao carregar histórico de resumos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
        <span>Carregando histórico...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-6">
        {error}
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        Nenhum resumo diário encontrado
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Histórico de Resumos Diários</h1>
          <button
            onClick={loadSummaries}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Atualizar
          </button>
        </div>

        <div className="space-y-8">
          {summaries.map((summary, index) => (
            <div key={index} className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {formatDate(summary.date)}
              </h2>

              {/* Clima */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Clima</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">
                    {summary.weather.temperature}°C
                  </span>
                  <span className="text-gray-600">
                    {summary.weather.condition}
                  </span>
                  <span className="text-gray-500">
                    {summary.weather.location}
                  </span>
                </div>
              </div>

              {/* Compromissos */}
              {summary.appointments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Compromissos</h3>
                  <div className="space-y-2">
                    {summary.appointments.map((appointment, i) => (
                      <div key={i} className="flex items-start">
                        <span className="text-gray-500 w-20">
                          {appointment.time}
                        </span>
                        <div>
                          <p className="font-medium">{appointment.title}</p>
                          {appointment.location && (
                            <p className="text-sm text-gray-500">
                              {appointment.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarefas */}
              {summary.tasks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Tarefas</h3>
                  <div className="space-y-2">
                    {summary.tasks.map((task, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            readOnly
                            className="mr-2"
                          />
                          <span className={task.completed ? 'line-through text-gray-500' : ''}>
                            {task.title}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notificações */}
              {summary.notifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Notificações</h3>
                  <div className="space-y-2">
                    {summary.notifications.map((notification, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2 rounded ${getNotificationColor(notification.type)}`}
                      >
                        {notification.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 