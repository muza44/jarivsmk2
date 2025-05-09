import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Lightbulb } from 'lucide-react';
import { MCPClient } from '@/lib/mcp-client';
import { MemoryService } from '@/lib/memory-service';

// Definição dos tipos para o SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mcpClient = useRef<MCPClient>(MCPClient.getInstance());
  const memoryService = useRef<MemoryService>(MemoryService.getInstance());

  // Inicializa os serviços
  useEffect(() => {
    const init = async () => {
      await mcpClient.current.initialize();
      await memoryService.current.initialize();
      await loadSuggestions();
    };
    init();

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'pt-BR';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          handleSendMessage(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Carrega sugestões personalizadas
  const loadSuggestions = async () => {
    try {
      const newSuggestions = await memoryService.current.getSuggestions();
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    }
  };

  // Rola para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Registra a interação
      await memoryService.current.recordInteraction({
        type: 'chat_message',
        content: { text },
        metadata: { isVoice: isListening }
      });

      // Processa o comando através do MCP
      const response = await mcpClient.current.responderIA(text);
      
      const jarvisMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, jarvisMessage]);
      speakText(response.message);

      // Atualiza sugestões após a interação
      await loadSuggestions();
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao processar sua solicitação.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText(errorMessage.text);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-[600px] jarvis-card">
      <div className="p-4 border-b border-cyan-400/20">
        <h2 className="jarvis-text text-xl">Assistente Jarvis</h2>
      </div>

      {suggestions.length > 0 && (
        <div className="p-4 border-b border-cyan-400/20 bg-black/20">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-cyan-400" />
            <span className="text-cyan-400 text-sm font-semibold">Sugestões</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-sm text-cyan-100/80 cursor-pointer hover:text-cyan-100"
                onClick={() => handleSendMessage(suggestion)}
              >
                {suggestion}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-cyan-400/20 text-cyan-100'
                    : 'bg-black/40 text-cyan-100'
                }`}
              >
                <p>{message.text}</p>
                <span className="text-xs text-cyan-400/60 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-cyan-400/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-black/40 border border-cyan-400/20 rounded-lg px-4 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400/40"
            disabled={isProcessing}
          />
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`p-2 rounded-lg ${
              isListening
                ? 'bg-red-500/20 text-red-400'
                : 'bg-cyan-400/20 text-cyan-400'
            } hover:bg-opacity-30 transition disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={isProcessing}
            className="p-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-opacity-30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
} 