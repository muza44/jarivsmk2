import { useState, useEffect } from 'react';
import { ImageGenerationService } from '../lib/image-generation-service';

interface GeneratedImage {
  url: string;
  prompt: string;
  metadata: {
    model: string;
    size: string;
    style?: string;
    quality?: string;
    timestamp: string;
  };
}

export default function ImageGenerationHistory() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const imageService = ImageGenerationService.getInstance();
      await imageService.initialize();
      const recentImages = await imageService.getRecentGenerations();
      setImages(recentImages);
    } catch (error) {
      setError('Erro ao carregar histórico de imagens');
      console.error('Erro ao carregar histórico de imagens:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (images.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        Nenhuma imagem gerada encontrada
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Histórico de Geração de Imagens</h1>
          <button
            onClick={loadImages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">
                    {formatDate(image.metadata.timestamp)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Modelo: {image.metadata.model}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{image.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Tamanho: {image.metadata.size}
                  </span>
                  {image.metadata.style && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Estilo: {image.metadata.style}
                    </span>
                  )}
                  {image.metadata.quality && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Qualidade: {image.metadata.quality}
                    </span>
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