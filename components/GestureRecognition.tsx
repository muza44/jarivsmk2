import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MultimodalService } from '@/lib/multimodal-service';

export default function GestureRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const multimodalService = useRef<MultimodalService>(MultimodalService.getInstance());

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
      }
    };

    if (isActive) {
      initCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  const toggleCamera = () => {
    setIsActive(!isActive);
  };

  const processFrame = async () => {
    if (!isActive || !videoRef.current || isProcessing) return;

    setIsProcessing(true);
    try {
      const gestureData = await multimodalService.current.processGesture(videoRef.current);
      if (gestureData) {
        setLastGesture(gestureData.type);
        // Aqui você pode adicionar lógica para executar ações baseadas no gesto
      }
    } catch (error) {
      console.error('Erro ao processar frame:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let animationFrameId: number;

    const startProcessing = () => {
      processFrame();
      animationFrameId = requestAnimationFrame(startProcessing);
    };

    if (isActive) {
      startProcessing();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive]);

  return (
    <div className="relative">
      <div className="relative w-full h-[300px] bg-black/40 rounded-lg overflow-hidden">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-cyan-400/60">Câmera desativada</p>
          </div>
        )}

        {lastGesture && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full"
          >
            <span className="text-cyan-400 text-sm">
              Gesto detectado: {lastGesture}
            </span>
          </motion.div>
        )}
      </div>

      <button
        onClick={toggleCamera}
        className={`mt-4 w-full py-2 rounded-lg transition ${
          isActive
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
        }`}
      >
        {isActive ? 'Desativar Câmera' : 'Ativar Câmera'}
      </button>
    </div>
  );
} 