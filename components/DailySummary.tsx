import { useState, useEffect } from 'react';
import { DailySummaryService } from '../lib/daily-summary-service';

export default function DailySummary() {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const summaryService = DailySummaryService.getInstance();
      await summaryService.initialize();
      const dailySummary = await summaryService.generateDailySummary();
      setSummary(dailySummary);
    } catch (error) {
      setError('Erro ao carregar resumo diário');
      console.error('Erro ao carregar resumo diário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Clima */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">🌤️ Clima</h2>
          <p className="text-gray-700">
            {summary.weather.location}: {summary.weather.temperature}°C, {summary.weather.condition}
          </p>
        </div>

        {/* Compromissos */}
        {summary.appointments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">📅 Compromissos</h2>
            <ul className="space-y-2">
              {summary.appointments.map((apt: any, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-700">
                    {apt.title} às {apt.time}
                    {apt.location && ` em ${apt.location}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tarefas */}
        {summary.tasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">📝 Tarefas</h2>
            <ul className="space-y-2">
              {summary.tasks.map((task: any, index: number) => (
                <li key={index} className="flex items-start">
                  <span className={`mr-2 ${task.completed ? 'text-green-500' : 'text-gray-400'}`}>
                    {task.completed ? '✅' : '⭕'}
                  </span>
                  <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notificações */}
        {summary.notifications.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">🔔 Notificações</h2>
            <ul className="space-y-2">
              {summary.notifications.map((notif: any, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-700">{notif.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={loadSummary}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Atualizar Resumo
        </button>
      </div>
    </div>
  );
} 