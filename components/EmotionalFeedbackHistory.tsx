import { useState, useEffect } from 'react';
import { EmotionalFeedbackService } from '../lib/emotional-feedback-service';

interface EmotionalState {
  mood: number;
  energy: number;
  stress: number;
  timestamp: string;
  context?: string;
}

interface EmotionalResponse {
  tone: 'positive' | 'neutral' | 'negative';
  message: string;
  suggestions?: string[];
}

interface EmotionalFeedback {
  state: EmotionalState;
  response: EmotionalResponse;
}

export default function EmotionalFeedbackHistory() {
  const [feedbacks, setFeedbacks] = useState<EmotionalFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const feedbackService = EmotionalFeedbackService.getInstance();
      await feedbackService.initialize();
      const recentFeedbacks = await feedbackService.getRecentFeedbacks();
      setFeedbacks(recentFeedbacks);
    } catch (error) {
      setError('Erro ao carregar histórico de feedback emocional');
      console.error('Erro ao carregar histórico de feedback emocional:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '🙁';
    return '😢';
  };

  const getEnergyEmoji = (energy: number) => {
    if (energy >= 8) return '⚡';
    if (energy >= 6) return '🔋';
    if (energy >= 4) return '🔌';
    if (energy >= 2) return '🪫';
    return '💤';
  };

  const getStressEmoji = (stress: number) => {
    if (stress >= 8) return '😰';
    if (stress >= 6) return '😓';
    if (stress >= 4) return '😮‍💨';
    if (stress >= 2) return '😌';
    return '😴';
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'neutral':
        return 'bg-blue-100 text-blue-800';
      case 'negative':
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

  if (feedbacks.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        Nenhum feedback emocional encontrado
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Histórico de Feedback Emocional</h1>
          <button
            onClick={loadFeedbacks}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Atualizar
          </button>
        </div>

        <div className="space-y-8">
          {feedbacks.map((feedback, index) => (
            <div key={index} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">
                  {formatDate(feedback.state.timestamp)}
                </h2>
                {feedback.state.context && (
                  <span className="text-sm text-gray-500">
                    Contexto: {feedback.state.context}
                  </span>
                )}
              </div>

              {/* Estado Emocional */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Estado Emocional</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Humor</span>
                      <span className="text-2xl">{getMoodEmoji(feedback.state.mood)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${(feedback.state.mood / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 mt-1">
                      {feedback.state.mood}/10
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Energia</span>
                      <span className="text-2xl">{getEnergyEmoji(feedback.state.energy)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ width: `${(feedback.state.energy / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 mt-1">
                      {feedback.state.energy}/10
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Estresse</span>
                      <span className="text-2xl">{getStressEmoji(feedback.state.stress)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-400 h-2 rounded-full"
                        style={{ width: `${(feedback.state.stress / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 mt-1">
                      {feedback.state.stress}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Resposta */}
              <div>
                <h3 className="text-lg font-medium mb-2">Resposta</h3>
                <div className={`p-4 rounded-lg ${getToneColor(feedback.response.tone)}`}>
                  <p className="mb-2">{feedback.response.message}</p>
                  {feedback.response.suggestions && feedback.response.suggestions.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-1">Sugestões:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {feedback.response.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 