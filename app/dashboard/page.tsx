import React from 'react'
import { Sun, Mic, Upload, Trophy, Image, Calendar, Play, Settings, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const cards = [
  { href: '/clima', icon: <Sun size={32} />, label: 'Clima' },
  { href: '/mvp', icon: <Mic size={32} />, label: 'MVP IA' },
  { href: '/upload', icon: <Upload size={32} />, label: 'Upload' },
  { href: '/apostas', icon: <Trophy size={32} />, label: 'Apostas' },
  { href: '/imagem', icon: <Image size={32} />, label: 'Imagem IA' },
  { href: '/agenda', icon: <Calendar size={32} />, label: 'Agenda' },
  { href: '/musica', icon: <Play size={32} />, label: 'Música' },
  { href: '/chat', icon: <MessageCircle size={32} />, label: 'Chatbot' },
  { href: '/config', icon: <Settings size={32} />, label: 'Configurações' },
]

export default function DashboardPage() {
  return (
    <div className="p-10">
      <div className="text-3xl md:text-4xl font-extrabold text-cyan-300 drop-shadow-cyan-400/30 text-center mb-4 animate-fadeIn">
        Bem-vindo ao seu Painel Jarvis
      </div>
      <div className="text-cyan-100/80 text-lg font-mono tracking-widest text-center mb-10 animate-fadeIn">
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} - {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {cards.map(card => (
          <Link key={card.href} href={card.href} className="rounded-2xl p-8 bg-[#101c2c] border border-cyan-400/20 shadow-lg flex flex-col items-center gap-4 hover:scale-105 hover:shadow-cyan-400/30 hover:border-cyan-300/60 transition-all">
            <div className="text-cyan-300">{card.icon}</div>
            <div className="text-lg font-bold text-cyan-100">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
} 