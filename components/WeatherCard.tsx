import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { APIService } from '@/lib/api-service';

export default function WeatherCard() {
  const [weather, setWeather] = useState<{
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    location: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiService = APIService.getInstance();

  useEffect(() => {
    const init = async () => {
      await apiService.initialize();
      fetchWeather();
    };
    init();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getWeatherData('Cotia');
      if (data) {
        setWeather(data);
      } else {
        setError('Não foi possível obter os dados do clima.');
      }
    } catch (error) {
      setError('Erro ao buscar dados do clima.');
      console.error('Erro ao buscar clima:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('chuva')) return <CloudRain className="text-blue-400" size={32} />;
    if (lowerCondition.includes('neve')) return <CloudSnow className="text-blue-200" size={32} />;
    if (lowerCondition.includes('nublado')) return <Cloud className="text-gray-400" size={32} />;
    if (lowerCondition.includes('vento')) return <Wind className="text-gray-300" size={32} />;
    return <Sun className="text-yellow-400" size={32} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-black/40 rounded-lg border border-cyan-400/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-cyan-400">Clima</h2>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="text-cyan-400 hover:text-cyan-300 transition disabled:opacity-50"
        >
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : weather ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-cyan-100">{weather.location}</h3>
              <p className="text-cyan-400/80">{weather.condition}</p>
            </div>
            {getWeatherIcon(weather.condition)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-cyan-400/60 text-sm">Temperatura</p>
              <p className="text-cyan-100 text-xl font-semibold">
                {weather.temperature.toFixed(1)}°C
              </p>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-cyan-400/60 text-sm">Umidade</p>
              <p className="text-cyan-100 text-xl font-semibold">
                {weather.humidity}%
              </p>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-cyan-400/60 text-sm">Vento</p>
              <p className="text-cyan-100 text-xl font-semibold">
                {weather.windSpeed} m/s
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-cyan-400/60 text-center py-8">
          Nenhum dado disponível
        </div>
      )}
    </motion.div>
  );
} 