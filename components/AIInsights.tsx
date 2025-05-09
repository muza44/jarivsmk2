import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, Calendar, Thermometer, Lightbulb, Music, AlertCircle } from 'lucide-react';
import { AIService } from '../lib/ai-service';

interface Prediction {
  id: string;
  type: 'behavior' | 'preference' | 'schedule' | 'environment';
  confidence: number;
  data: any;
  timestamp: Date;
}

export default function AIInsights() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const aiService = AIService.getInstance();

  useEffect(() => {
    loadPredictions();
    const interval = setInterval(loadPredictions, 5 * 60 * 1000); // Atualiza a cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const data = await aiService.getPredictions();
      setPredictions(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar predições');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'behavior':
        return <Brain className="w-6 h-6" />;
      case 'preference':
        return <Lightbulb className="w-6 h-6" />;
      case 'schedule':
        return <Calendar className="w-6 h-6" />;
      case 'environment':
        return <Thermometer className="w-6 h-6" />;
      default:
        return <Brain className="w-6 h-6" />;
    }
  };

  const formatPredictionData = (prediction: Prediction) => {
    switch (prediction.type) {
      case 'behavior':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Próxima ação: {prediction.data.nextAction.action}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Horário previsto: {new Date(prediction.data.nextAction.time).toLocaleTimeString()}</span>
            </div>
          </div>
        );

      case 'preference':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4" />
              <span>Temperatura: {prediction.data.temperature.value}°C</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Iluminação: {prediction.data.lighting.brightness}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4" />
              <span>Música: {prediction.data.music.genre}</span>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Próximo evento: {prediction.data.nextEvent.event}</span>
            </div>
            {prediction.data.conflicts?.length > 0 && (
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span>Conflito detectado</span>
              </div>
            )}
          </div>
        );

      case 'environment':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4" />
              <span>Temperatura: {prediction.data.temperature.value}°C</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Iluminação: {prediction.data.lighting.level}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Insights da IA</h2>
        <button
          onClick={loadPredictions}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-4">{error}</div>
      ) : (
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                {getIconForType(prediction.type)}
                <h3 className="text-lg font-semibold text-white capitalize">
                  {prediction.type}
                </h3>
                <div className="ml-auto">
                  <span className="text-sm text-gray-400">
                    {Math.round(prediction.confidence * 100)}% confiança
                  </span>
                </div>
              </div>
              {formatPredictionData(prediction)}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
} 