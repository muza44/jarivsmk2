import { useState, useEffect } from 'react';
import { MemoryService } from '../lib/memory-service';
import { ImageGenerationService } from '../lib/image-generation-service';
import { AudioTranscriptionService } from '../lib/audio-transcription-service';
import { supabase } from '../lib/supabase';

interface APIConfig {
  openaiApiKey: string;
  stabilityApiKey: string;
}

export default function APIConfig() {
  const [config, setConfig] = useState<APIConfig>({
    openaiApiKey: '',
    stabilityApiKey: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const memoryService = MemoryService.getInstance();
      await memoryService.initialize();

      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', memoryService.getUserId())
        .single();

      if (existingPrefs?.preferences) {
        setConfig({
          openaiApiKey: existingPrefs.preferences.openaiApiKey || '',
          stabilityApiKey: existingPrefs.preferences.stabilityApiKey || ''
        });
      }
    } catch (error) {
      setError('Erro ao carregar configurações');
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const memoryService = MemoryService.getInstance();
      const imageService = ImageGenerationService.getInstance();
      const audioService = AudioTranscriptionService.getInstance();

      // Salva as chaves da API
      await memoryService.updatePreference({
        key: 'openaiApiKey',
        value: config.openaiApiKey
      });

      await memoryService.updatePreference({
        key: 'stabilityApiKey',
        value: config.stabilityApiKey
      });

      // Configura os serviços
      await imageService.setApiKey(config.stabilityApiKey);
      await audioService.setApiKey(config.openaiApiKey);

      setSuccess('Configurações salvas com sucesso!');
    } catch (error) {
      setError('Erro ao salvar configurações');
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Configuração de APIs</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            id="openaiApiKey"
            name="openaiApiKey"
            value={config.openaiApiKey}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="sk-..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Usado para transcrição de áudio e geração de imagens com DALL·E
          </p>
        </div>

        <div>
          <label htmlFor="stabilityApiKey" className="block text-sm font-medium text-gray-700 mb-2">
            Stability AI API Key
          </label>
          <input
            type="password"
            id="stabilityApiKey"
            name="stabilityApiKey"
            value={config.stabilityApiKey}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="sk-..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Usado para geração de imagens com Stable Diffusion
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
} 