import { supabase } from './supabase';
import { MemoryService } from './memory-service';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  previewUrl?: string;
}

export class APIService {
  private static instance: APIService;
  private memoryService: MemoryService;
  private isInitialized: boolean = false;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Inicializa o serviço de memória
    await this.memoryService.initialize();

    // Registra o uso do serviço de APIs
    await this.memoryService.recordUsagePattern('api_service', {
      initialized: true,
      timestamp: new Date().toISOString()
    });

    this.isInitialized = true;
  }

  // Integração com OpenWeather API
  async getWeatherData(location: string): Promise<WeatherData | null> {
    if (!this.isInitialized) throw new Error('APIService não inicializado');

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
      );
      const data = await response.json();

      const weatherData: WeatherData = {
        temperature: data.main.temp,
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        location: data.name
      };

      // Registra o uso da API de clima
      await this.memoryService.recordUsagePattern('weather_api', {
        location,
        temperature: weatherData.temperature
      });

      return weatherData;
    } catch (error) {
      console.error('Erro ao obter dados do clima:', error);
      return null;
    }
  }

  // Integração com Google Calendar API
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    if (!this.isInitialized) throw new Error('APIService não inicializado');

    try {
      // Aqui você implementaria a integração real com a Google Calendar API
      // Por enquanto, retornamos dados mockados
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Reunião de Equipe',
          start: new Date(),
          end: new Date(Date.now() + 3600000),
          description: 'Discussão sobre o projeto Jarvis'
        }
      ];

      // Registra o uso da API de calendário
      await this.memoryService.recordUsagePattern('calendar_api', {
        eventCount: mockEvents.length
      });

      return mockEvents;
    } catch (error) {
      console.error('Erro ao obter eventos do calendário:', error);
      return [];
    }
  }

  // Integração com Spotify API
  async getCurrentTrack(): Promise<SpotifyTrack | null> {
    if (!this.isInitialized) throw new Error('APIService não inicializado');

    try {
      // Aqui você implementaria a integração real com a Spotify API
      // Por enquanto, retornamos dados mockados
      const mockTrack: SpotifyTrack = {
        id: '1',
        name: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        imageUrl: 'https://example.com/cover.jpg',
        previewUrl: 'https://example.com/preview.mp3'
      };

      // Registra o uso da API do Spotify
      await this.memoryService.recordUsagePattern('spotify_api', {
        trackName: mockTrack.name
      });

      return mockTrack;
    } catch (error) {
      console.error('Erro ao obter música atual:', error);
      return null;
    }
  }

  // Integração com OpenAI API
  async generateText(prompt: string): Promise<string | null> {
    if (!this.isInitialized) throw new Error('APIService não inicializado');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'Você é Jarvis, um assistente pessoal futurista.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content;

      // Registra o uso da API da OpenAI
      await this.memoryService.recordUsagePattern('openai_api', {
        promptLength: prompt.length,
        responseLength: generatedText?.length
      });

      return generatedText || null;
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
      return null;
    }
  }

  // Integração com DALL-E API
  async generateImage(prompt: string): Promise<string | null> {
    if (!this.isInitialized) throw new Error('APIService não inicializado');

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          prompt,
          n: 1,
          size: '512x512'
        })
      });

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;

      // Registra o uso da API do DALL-E
      await this.memoryService.recordUsagePattern('dalle_api', {
        promptLength: prompt.length,
        hasImage: !!imageUrl
      });

      return imageUrl || null;
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      return null;
    }
  }
} 