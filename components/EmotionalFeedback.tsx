import { useState, useEffect } from 'react';
import { EmotionalFeedbackService } from '../lib/emotional-feedback-service';

export default function EmotionalFeedback() {
  const [state, setState] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const feedbackService = EmotionalFeedbackService.getInstance();
      await feedbackService.initialize();
      const currentState = feedbackService.getCurrentState();
      setState(currentState);
    } catch (error) {
      setError('Erro ao carregar estado emocional');
      console.error('Erro ao carregar estado emocional:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteraction = async (interaction: string) => {
    try {
      const feedbackService = EmotionalFeedbackService.getInstance();
      const emotionalResponse = await feedbackService.analyzeUserState(interaction);
      setResponse(emotionalResponse);
      await loadState(); // Recarrega o estado após a interação
    } catch (error) {
      setError('Erro ao processar interação');
      console.error('Erro ao processar interação:', error);
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

  if (!state) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Estado Atual */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Estado Emocional</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Humor</p>
              <p className="text-lg font-medium">{state.mood}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Energia</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${state.energy}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">{state.energy}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Estresse</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{ width: `${state.stress}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">{state.stress}%</p>
            </div>
          </div>
        </div>

        {/* Resposta */}
        {response && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Resposta</h2>
            <div className={`p-4 rounded-lg ${
              response.tone === 'concerned' ? 'bg-yellow-50' :
              response.tone === 'excited' ? 'bg-green-50' :
              response.tone === 'formal' ? 'bg-blue-50' :
              'bg-gray-50'
            }`}>
              <p className="text-gray-700">{response.message}</p>
            </div>
          </div>
        )}

        {/* Interação */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Como você está se sentindo?</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleInteraction('Estou feliz e energizado')}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              😊 Feliz
            </button>
            <button
              onClick={() => handleInteraction('Estou cansado e precisando descansar')}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              😴 Cansado
            </button>
            <button
              onClick={() => handleInteraction('Estou estressado e irritado')}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              😠 Estressado
            </button>
            <button
              onClick={() => handleInteraction('Estou focado e concentrado')}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
            >
              🎯 Focado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 