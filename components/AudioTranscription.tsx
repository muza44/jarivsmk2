import { useState, useRef } from 'react';
import { AudioTranscriptionService } from '../lib/audio-transcription-service';

interface TranscriptionOptions {
  model: 'whisper-1';
  language?: string;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json';
  temperature?: number;
}

export default function AudioTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<TranscriptionOptions>({
    model: 'whisper-1',
    responseFormat: 'text',
    temperature: 0
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setError('Erro ao acessar o microfone');
      console.error('Erro ao acessar o microfone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setError(null);
    setTranscription(null);
    setIsLoading(true);

    try {
      const transcriptionService = AudioTranscriptionService.getInstance();
      await transcriptionService.initialize();
      const result = await transcriptionService.transcribeAudio(audioBlob, options);
      setTranscription(result.text);
    } catch (error) {
      setError('Erro ao transcrever áudio');
      console.error('Erro ao transcrever áudio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleTranscription(file);
    }
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Transcrição de Áudio</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Opções de Transcrição */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                id="language"
                name="language"
                value={options.language || ''}
                onChange={handleOptionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Detectar automaticamente</option>
                <option value="pt">Português</option>
                <option value="en">Inglês</option>
                <option value="es">Espanhol</option>
                <option value="fr">Francês</option>
                <option value="de">Alemão</option>
              </select>
            </div>

            <div>
              <label htmlFor="responseFormat" className="block text-sm font-medium text-gray-700 mb-2">
                Formato da Resposta
              </label>
              <select
                id="responseFormat"
                name="responseFormat"
                value={options.responseFormat}
                onChange={handleOptionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="text">Texto</option>
                <option value="json">JSON</option>
                <option value="srt">SRT</option>
                <option value="verbose_json">JSON Detalhado</option>
              </select>
            </div>
          </div>

          {/* Controles de Gravação */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
            </button>

            <div className="relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Enviar Arquivo
              </label>
            </div>
          </div>

          {/* Indicador de Status */}
          {isRecording && (
            <div className="flex items-center justify-center">
              <div className="animate-pulse bg-red-500 rounded-full w-4 h-4 mr-2"></div>
              <span className="text-red-500">Gravando...</span>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              <span>Transcrevendo áudio...</span>
            </div>
          )}

          {/* Transcrição */}
          {transcription && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Transcrição</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{transcription}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 