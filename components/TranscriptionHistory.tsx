import { useState, useEffect } from 'react';
import { AudioTranscriptionService } from '../lib/audio-transcription-service';

interface TranscriptionResult {
  text: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  metadata: {
    model: string;
    language?: string;
    duration: number;
    timestamp: string;
  };
}

export default function TranscriptionHistory() {
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      const transcriptionService = AudioTranscriptionService.getInstance();
      await transcriptionService.initialize();
      const recentTranscriptions = await transcriptionService.getRecentTranscriptions();
      setTranscriptions(recentTranscriptions);
    } catch (error) {
      setError('Erro ao carregar histórico de transcrições');
      console.error('Erro ao carregar histórico de transcrições:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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

  if (transcriptions.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        Nenhuma transcrição encontrada
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Histórico de Transcrições</h1>
          <button
            onClick={loadTranscriptions}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Atualizar
          </button>
        </div>

        <div className="space-y-6">
          {transcriptions.map((transcription, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-sm text-gray-500">
                    {formatDate(transcription.metadata.timestamp)}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">
                    Duração: {formatDuration(transcription.metadata.duration)}
                  </span>
                  {transcription.metadata.language && (
                    <>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        Idioma: {transcription.metadata.language}
                      </span>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  Modelo: {transcription.metadata.model}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{transcription.text}</p>
              </div>

              {transcription.segments && transcription.segments.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Segmentos</h3>
                  <div className="space-y-2">
                    {transcription.segments.map((segment) => (
                      <div key={segment.id} className="flex items-start">
                        <span className="text-sm text-gray-500 w-24">
                          {formatDuration(segment.start)} - {formatDuration(segment.end)}
                        </span>
                        <p className="text-sm flex-1">{segment.text}</p>
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