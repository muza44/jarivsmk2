import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="jarvis-text text-3xl mb-2">Chat com Jarvis</h1>
        <p className="text-cyan-100/80">
          Converse com o Jarvis usando texto ou voz. Ele pode ajudar com tarefas, responder perguntas e executar comandos.
        </p>
      </div>
      
      <ChatInterface />
    </div>
  );
} 