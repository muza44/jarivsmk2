import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X } from 'lucide-react';
import { MultimodalService } from '@/lib/multimodal-service';

export default function ImageAnalysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    objects: string[];
    text?: string;
    confidence: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multimodalService = useRef<MultimodalService>(MultimodalService.getInstance());

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg');
      setSelectedImage(imageData);

      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Erro ao capturar imagem da câmera:', error);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const result = await multimodalService.current.analyzeImage(selectedImage);
      if (result) {
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[300px] bg-black/40 rounded-lg overflow-hidden">
        {selectedImage ? (
          <div className="relative w-full h-full">
            <img
              src={selectedImage}
              alt="Imagem selecionada"
              className="w-full h-full object-contain"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 bg-black/60 rounded-full hover:bg-black/80 transition"
            >
              <X size={20} className="text-cyan-400" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-cyan-400/60">Nenhuma imagem selecionada</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition"
        >
          <Upload size={20} className="mx-auto" />
        </button>
        <button
          onClick={handleCameraCapture}
          className="flex-1 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition"
        >
          <Camera size={20} className="mx-auto" />
        </button>
      </div>

      {selectedImage && (
        <button
          onClick={analyzeImage}
          disabled={isAnalyzing}
          className="w-full py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analisando...' : 'Analisar Imagem'}
        </button>
      )}

      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-black/40 rounded-lg space-y-2"
        >
          <h3 className="text-cyan-400 font-semibold">Resultados da Análise</h3>
          <div className="space-y-1">
            <p className="text-cyan-100">
              Objetos detectados: {analysisResult.objects.join(', ')}
            </p>
            {analysisResult.text && (
              <p className="text-cyan-100">Texto: {analysisResult.text}</p>
            )}
            <p className="text-cyan-400/60 text-sm">
              Confiança: {(analysisResult.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 