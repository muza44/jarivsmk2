import { useState } from 'react';
import { ImageGenerationService } from '../lib/image-generation-service';

interface GenerationOptions {
  model: 'dalle' | 'stable-diffusion';
  size: '256x256' | '512x512' | '1024x1024';
  style?: string;
  quality?: 'standard' | 'hd';
}

export default function ImageGeneration() {
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<GenerationOptions>({
    model: 'dalle',
    size: '512x512',
    quality: 'standard'
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGeneratedImage(null);
    setIsLoading(true);

    try {
      const imageService = ImageGenerationService.getInstance();
      await imageService.initialize();
      const result = await imageService.generateImage(prompt, options);
      setGeneratedImage(result.url);
    } catch (error) {
      setError('Erro ao gerar imagem');
      console.error('Erro ao gerar imagem:', error);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-bold mb-6">Geração de Imagens</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Imagem
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Descreva a imagem que você quer gerar..."
              required
            />
          </div>

          {/* Opções */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <select
                id="model"
                name="model"
                value={options.model}
                onChange={handleOptionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="dalle">DALL·E</option>
                <option value="stable-diffusion">Stable Diffusion</option>
              </select>
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho
              </label>
              <select
                id="size"
                name="size"
                value={options.size}
                onChange={handleOptionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="256x256">256x256</option>
                <option value="512x512">512x512</option>
                <option value="1024x1024">1024x1024</option>
              </select>
            </div>

            {options.model === 'dalle' && (
              <div>
                <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-2">
                  Qualidade
                </label>
                <select
                  id="quality"
                  name="quality"
                  value={options.quality}
                  onChange={handleOptionChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="standard">Padrão</option>
                  <option value="hd">HD</option>
                </select>
              </div>
            )}

            {options.model === 'stable-diffusion' && (
              <div>
                <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                  Estilo
                </label>
                <select
                  id="style"
                  name="style"
                  value={options.style}
                  onChange={handleOptionChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Padrão</option>
                  <option value="anime">Anime</option>
                  <option value="photographic">Fotográfico</option>
                  <option value="digital-art">Arte Digital</option>
                  <option value="comic-book">Quadrinhos</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              {isLoading ? 'Gerando...' : 'Gerar Imagem'}
            </button>
          </div>
        </form>

        {/* Imagem Gerada */}
        {generatedImage && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Imagem Gerada</h2>
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <img
                src={generatedImage}
                alt="Imagem gerada"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 