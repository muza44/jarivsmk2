'use client'
import React, { useState, useRef } from 'react'
import { Sun, Cloud, Zap, Upload, Mic, Globe, Trophy, Settings, X, Play, Pause, ExternalLink, Image, Loader2, Send, Volume2, Calendar } from 'lucide-react'
import { Suspense } from 'react'
import BootScreen from '@/components/BootScreen'
import ChatInterface from '@/components/ChatInterface'
import GestureRecognition from '@/components/GestureRecognition'
import ImageAnalysis from '@/components/ImageAnalysis'
import WeatherCard from '@/components/WeatherCard'
import DeviceControl from '@/components/DeviceControl'
import AIInsights from '@/components/AIInsights'

const hudBg = "bg-gradient-to-br from-[#0a0f1c] via-[#101c2c] to-[#1a233a]"
const neon = "shadow-[0_0_16px_2px_rgba(0,255,255,0.15)]"
const borderNeon = "border border-cyan-400/30"
const glass = "backdrop-blur-md bg-white/5"
const cardBase = `rounded-2xl p-6 ${glass} ${borderNeon} ${neon} transition-all duration-300 hover:scale-[1.025] hover:shadow-cyan-400/30 hover:border-cyan-300/60`

// Chatbot GPT
function JarvisChatbotGPT() {
  const [messages, setMessages] = useState([{ from: 'jarvis', text: 'Olá, como posso ajudar hoje?' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  async function sendToGPT(message: string) {
    setLoading(true)
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'Você é Jarvis, um assistente pessoal futurista, objetivo e amigável.' },
            ...messages.map(m => ({
              role: m.from === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: message }
          ],
          temperature: 0.7
        })
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'Desculpe, não consegui responder agora.'
      setMessages(msgs => [...msgs, { from: 'jarvis', text: reply }])
      if ('speechSynthesis' in window) {
        const utter = new window.SpeechSynthesisUtterance(reply)
        utter.lang = 'pt-BR'
        window.speechSynthesis.speak(utter)
      }
    } catch (e) {
      setMessages(msgs => [...msgs, { from: 'jarvis', text: 'Erro ao conectar com a IA.' }])
    }
    setLoading(false)
  }

  function handleSend() {
    if (!input.trim()) return
    setMessages([...messages, { from: 'user', text: input }])
    sendToGPT(input)
    setInput('')
  }

  function startListening() {
    if (!('webkitSpeechRecognition' in window)) return
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript)
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognition.start()
    setListening(true)
    recognitionRef.current = recognition
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  function speakLastJarvis() {
    const last = [...messages].reverse().find(m => m.from === 'jarvis')
    if (last && 'speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(last.text)
      utter.lang = 'pt-BR'
      window.speechSynthesis.speak(utter)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[90vw] bg-[#18181c] border border-cyan-400/30 rounded-2xl shadow-2xl flex flex-col">
      <div className="p-4 border-b border-cyan-400/10 flex items-center gap-2 text-cyan-200 font-bold">
        <span className="animate-pulse">🧠</span> Jarvis IA
      </div>
      <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-60">
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.from === 'jarvis' ? 'text-cyan-200' : 'text-white text-right'}`}>{msg.text}</div>
        ))}
        {loading && <div className="text-cyan-400 animate-pulse">Jarvis está pensando...</div>}
      </div>
      <div className="flex items-center gap-2 p-3 border-t border-cyan-400/10">
        <button
          className={`p-2 rounded-full ${listening ? 'bg-cyan-700' : 'bg-cyan-900'} text-cyan-200`}
          onClick={listening ? stopListening : startListening}
          title="Falar"
        >
          <Mic className={listening ? 'animate-pulse' : ''} size={20} />
        </button>
        <input
          className="flex-1 bg-[#23232a] border border-cyan-400/20 rounded px-3 py-2 text-cyan-100"
          placeholder="Digite ou fale..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button className="p-2 rounded-full bg-cyan-900 text-cyan-200" onClick={handleSend} title="Enviar">
          <Send size={20} />
        </button>
        <button className="p-2 rounded-full bg-cyan-900 text-cyan-200" onClick={speakLastJarvis} title="Ouvir resposta">
          <Volume2 size={20} />
        </button>
      </div>
    </div>
  )
}

// Card de Clima via GPT
function JarvisClimaCard() {
  const [clima, setClima] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchClimaGPT() {
    setLoading(true)
    setClima(null)
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'Você é um assistente de IA que responde sobre clima de forma clara e objetiva.' },
            { role: 'user', content: 'Me diga o clima de Cotia hoje, em poucas linhas.' }
          ],
          temperature: 0.5
        })
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'Não foi possível obter o clima agora.'
      setClima(reply)
    } catch (e) {
      setClima('Erro ao consultar o clima.')
    }
    setLoading(false)
  }

  return (
    <section className={cardBase + " flex flex-col gap-3 items-center"}>
      <div className="flex items-center gap-2 text-cyan-300 font-bold text-lg">
        <Sun size={28} /> Clima Inteligente (GPT)
      </div>
      <button
        className="bg-cyan-700/80 hover:bg-cyan-600/90 text-white px-4 py-2 rounded-lg font-semibold shadow-cyan-400/20 shadow transition"
        onClick={fetchClimaGPT}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin inline" /> : 'Atualizar Clima'}
      </button>
      <div className="text-cyan-100 text-center min-h-[48px]">
        {clima ? clima : 'Clique para ver o clima de hoje.'}
      </div>
    </section>
  )
}

// Card de MVP via GPT
function JarvisMVPCard() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function gerarMVP() {
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'Você é um consultor de startups e IA. Responda de forma clara, objetiva e estruturada.' },
            { role: 'user', content: `Minha ideia: ${input}\n\nMe entregue:\n- MVP técnico (funcionalidades mínimas)\n- MVP de negócio (modelo de validação rápida)\n- Sugestões de ferramentas\n- Roadmap de 7 dias` }
          ],
          temperature: 0.7
        })
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'Não foi possível gerar o MVP agora.'
      setResult(reply)
    } catch (e) {
      setResult('Erro ao consultar a IA.')
    }
    setLoading(false)
  }

  return (
    <section className={cardBase + " flex flex-col gap-3 items-center"}>
      <div className="flex items-center gap-2 text-pink-300 font-bold text-lg">
        <Mic size={28} /> Gerador de MVP IA
      </div>
      <textarea
        className="w-full bg-[#23232a] border border-cyan-400/20 rounded px-3 py-2 text-cyan-100"
        placeholder="Descreva sua ideia de projeto ou produto..."
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={3}
      />
      <button
        className="bg-pink-700/80 hover:bg-pink-600/90 text-white px-4 py-2 rounded-lg font-semibold shadow-pink-400/20 shadow transition"
        onClick={gerarMVP}
        disabled={loading || !input}
      >
        {loading ? <Loader2 className="animate-spin inline" /> : 'Gerar MVP'}
      </button>
      <div className="text-pink-100 text-sm whitespace-pre-line min-h-[80px]">
        {result}
      </div>
    </section>
  )
}

// Card de Upload Inteligente
function JarvisUploadCard() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult('')
    setLoading(true)

    if (f.type.startsWith('audio/')) {
      // Transcrição com Whisper
      const formData = new FormData()
      formData.append('file', f)
      formData.append('model', 'whisper-1')
      formData.append('language', 'pt')
      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
        },
        body: formData
      })
      const data = await res.json()
      setResult(data.text || 'Não foi possível transcrever o áudio.')
    } else if (f.type.startsWith('image/')) {
      setResult('Imagem recebida! (OCR e análise em breve)')
    } else if (f.type === 'application/pdf') {
      setResult('PDF recebido! (Análise via GPT em breve)')
    } else {
      setResult('Tipo de arquivo não suportado.')
    }
    setLoading(false)
  }

  return (
    <section className={cardBase + " flex flex-col gap-3 items-center"}>
      <div className="flex items-center gap-2 text-green-300 font-bold text-lg">
        <Upload size={28} /> Upload Inteligente
      </div>
      <input
        type="file"
        className="text-cyan-100"
        onChange={handleUpload}
        accept="audio/*,image/*,application/pdf"
      />
      {loading && <Loader2 className="animate-spin text-green-400" />}
      <div className="text-green-100 text-sm whitespace-pre-line min-h-[48px]">
        {result}
      </div>
    </section>
  )
}

// Card de Análises de Apostas
function JarvisApostasCard() {
  const [analise, setAnalise] = useState('')
  const [loading, setLoading] = useState(false)

  async function gerarAnalise() {
    setLoading(true)
    setAnalise('')

    // 1. Buscar jogos do dia (balldontlie)
    const gamesRes = await fetch('https://www.balldontlie.io/api/v1/games?per_page=1')
    const gamesData = await gamesRes.json()
    const jogo = gamesData.data[0]
    const matchup = `${jogo.home_team.full_name} vs ${jogo.visitor_team.full_name}`

    // 2. Buscar odds (The Odds API)
    const oddsRes = await fetch('https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?regions=us&markets=h2h&apiKey=eb9aaf4f1e152ac66526071e7c3d8656')
    const oddsData = await oddsRes.json()
    const odds = oddsData[0]?.bookmakers?.[0]?.markets?.[0]?.outcomes?.map((o: any) => `${o.name}: ${o.price}`).join(' | ') || 'Odds não encontradas'

    // 3. Enviar para GPT
    const prompt = `Jogo de hoje: ${matchup}\nOdds: ${odds}\nFaça uma análise de aposta esportiva para esse jogo, como um especialista, em até 3 parágrafos.`
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Você é um especialista em apostas esportivas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    })
    const gptData = await gptRes.json()
    setAnalise(gptData.choices?.[0]?.message?.content || 'Não foi possível gerar a análise.')
    setLoading(false)
  }

  return (
    <section className={cardBase + " flex flex-col gap-3 items-center"}>
      <div className="flex items-center gap-2 text-yellow-300 font-bold text-lg">
        <Trophy size={28} /> Análise de Apostas (NBA)
      </div>
      <button
        className="bg-yellow-700/80 hover:bg-yellow-600/90 text-white px-4 py-2 rounded-lg font-semibold shadow-yellow-400/20 shadow transition"
        onClick={gerarAnalise}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin inline" /> : 'Gerar Análise'}
      </button>
      <div className="text-yellow-100 text-sm whitespace-pre-line min-h-[80px]">
        {analise}
      </div>
    </section>
  )
}

// Card de Geração de Imagem IA (DALL·E)
function JarvisImageGenCard() {
  const [prompt, setPrompt] = useState('')
  const [img, setImg] = useState('')
  const [loading, setLoading] = useState(false)

  async function gerarImagem() {
    setLoading(true)
    setImg('')
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
        },
        body: JSON.stringify({
          prompt,
          n: 1,
          size: '512x512'
        })
      })
      const data = await res.json()
      setImg(data.data?.[0]?.url || '')
    } catch (e) {
      setImg('')
    }
    setLoading(false)
  }

  return (
    <section className={cardBase + " flex flex-col gap-3 items-center"}>
      <div className="flex items-center gap-2 text-cyan-300 font-bold text-lg">
        <Image size={28} /> Geração de Imagem IA
      </div>
      <input
        className="w-full bg-[#23232a] border border-cyan-400/20 rounded px-3 py-2 text-cyan-100"
        placeholder="Descreva a imagem (ex: cidade futurista à noite)"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <button
        className="w-full bg-cyan-700/80 hover:bg-cyan-600/90 text-white py-2 rounded-lg font-semibold shadow-cyan-400/20 shadow transition"
        onClick={gerarImagem}
        disabled={loading || !prompt}
      >
        {loading ? <Loader2 className="animate-spin inline" /> : 'Gerar Imagem'}
      </button>
      {img && (
        <div className="w-full flex flex-col items-center gap-2 mt-2">
          <img src={img} alt="IA" className="rounded-lg shadow-lg max-h-48" />
          <a href={img} download className="text-cyan-400 text-xs hover:underline">Baixar imagem</a>
        </div>
      )}
    </section>
  )
}

// Player de Música (mock visual, pronto para integração real)
function JarvisMusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const mockTrack = {
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    image: 'https://i.scdn.co/image/ab67616d0000b273e8b1b1b1b1b1b1b1b1b1b1b1',
    url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b'
  }
  return (
    <div className="fixed bottom-6 left-6 z-50 w-[320px] max-w-[90vw] bg-[#18181c] border border-cyan-400/30 rounded-2xl shadow-2xl flex items-center gap-3 p-3">
      <img src={mockTrack.image} alt="cover" className="w-14 h-14 rounded-lg shadow" />
      <div className="flex-1">
        <div className="text-cyan-200 font-bold">{mockTrack.name}</div>
        <div className="text-cyan-100 text-xs">{mockTrack.artist}</div>
        <a href={mockTrack.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs flex items-center gap-1 hover:underline">
          Abrir no Spotify <ExternalLink size={14} />
        </a>
      </div>
      <button className="p-2 rounded-full bg-cyan-900 text-cyan-200" onClick={() => setPlaying(p => !p)} title={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={20} /> : <Play size={20} />}
      </button>
    </div>
  )
}

// Agenda (mock visual, pronto para integração real)
function JarvisAgendaCard() {
  const compromissos = [
    { hora: '10:00', evento: 'Reunião com equipe' },
    { hora: '14:00', evento: 'Call com cliente' },
    { hora: '16:30', evento: 'Revisão de código' }
  ]
  return (
    <section className={cardBase + " flex flex-col gap-3 items-center"}>
      <div className="flex items-center gap-2 text-cyan-300 font-bold text-lg">
        <Calendar size={28} /> Agenda do Dia (Google)
      </div>
      <ul className="w-full text-cyan-100 text-sm">
        {compromissos.map((c, i) => (
          <li key={i} className="flex justify-between border-b border-cyan-400/10 py-1">
            <span>{c.hora}</span>
            <span>{c.evento}</span>
          </li>
        ))}
      </ul>
      <div className="text-cyan-400 text-xs mt-2">Integração real com Google Calendar em breve</div>
    </section>
  )
}

// Painel de Configurações (modal)
function JarvisConfigPanel({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [cidade, setCidade] = useState('Cotia')
  const [tema, setTema] = useState('dark')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
      <div className="bg-[#18181c] border border-cyan-400/30 rounded-2xl p-8 min-w-[320px] max-w-[90vw] shadow-2xl relative animate-fadeInUp">
        <button onClick={onClose} className="absolute top-3 right-3 text-cyan-300 hover:text-cyan-100"><X size={22} /></button>
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-lg mb-4">
          <Settings size={28} /> Configurações Jarvis
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-cyan-100 text-sm">Cidade do Clima</label>
            <input className="w-full bg-[#23232a] border border-cyan-400/20 rounded px-3 py-2 text-cyan-100" value={cidade} onChange={e => setCidade(e.target.value)} />
          </div>
          <div>
            <label className="text-cyan-100 text-sm">Tema Visual</label>
            <select className="w-full bg-[#23232a] border border-cyan-400/20 rounded px-3 py-2 text-cyan-100" value={tema} onChange={e => setTema(e.target.value)}>
              <option value="dark">Escuro (Jarvis)</option>
              <option value="light">Claro</option>
            </select>
          </div>
        </div>
        <button className="mt-6 w-full bg-cyan-700/80 hover:bg-cyan-600/90 text-white py-2 rounded-lg font-semibold shadow-cyan-400/20 shadow transition">
          Salvar Configurações
        </button>
      </div>
    </div>
  )
}

// Componente principal Home
export default function Home() {
  const [showConfig, setShowConfig] = useState(false)
  const [isBooted, setIsBooted] = useState(false)

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<div>Carregando...</div>}>
        <BootScreen onBootComplete={() => setIsBooted(true)} />
      </Suspense>

      {isBooted && (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <ChatInterface />
              <GestureRecognition />
            </div>
            <div className="space-y-8">
              <WeatherCard />
              <ImageAnalysis />
              <DeviceControl />
              <AIInsights />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}