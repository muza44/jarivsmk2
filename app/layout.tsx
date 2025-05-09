'use client'
import './globals.css'
import { supabase } from '@/lib/supabase'
import React, { useState } from 'react'
import { Sun, Mic, Upload, Trophy, Image, Calendar, Play, Settings, MessageCircle, Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import BootScreen from '@/components/BootScreen'

export const metadata = {
  title: 'Painel Jarvis',
  description: 'Seu painel pessoal inteligente com IA',
}

const sidebarItems = [
  { href: '/dashboard', icon: <HomeIcon size={22} />, label: 'Dashboard' },
  { href: '/clima', icon: <Sun size={22} />, label: 'Clima' },
  { href: '/mvp', icon: <Mic size={22} />, label: 'MVP IA' },
  { href: '/upload', icon: <Upload size={22} />, label: 'Upload' },
  { href: '/apostas', icon: <Trophy size={22} />, label: 'Apostas' },
  { href: '/imagem', icon: <Image size={22} />, label: 'Imagem IA' },
  { href: '/agenda', icon: <Calendar size={22} />, label: 'Agenda' },
  { href: '/musica', icon: <Play size={22} />, label: 'Música' },
  { href: '/chat', icon: <MessageCircle size={22} />, label: 'Chatbot' },
  { href: '/config', icon: <Settings size={22} />, label: 'Configurações' },
]

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isBooting, setIsBooting] = useState(true);

  // Checa sessão do usuário
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (e) {
    user = null;
  }

  // Se não estiver logado e não for a página de login, redireciona
  if (!user && typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
    return null;
  }

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen bg-background text-foreground">
        {isBooting && <BootScreen onBootComplete={() => setIsBooting(false)} />}
        
        <aside className="w-56 bg-black/40 backdrop-blur-sm border-r border-cyan-400/20 flex flex-col py-8 px-4 gap-4 fixed h-full z-40">
          <div className="jarvis-text text-2xl mb-8 text-center">JARVIS</div>
          <nav className="flex flex-col gap-2">
            {sidebarItems.map(item => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-cyan-100 hover:bg-cyan-700/20 transition font-semibold jarvis-card"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto text-xs text-cyan-400/60 text-center">by Arthur</div>
        </aside>
        
        <main className="flex-1 ml-56">
          {user && (
            <header className="w-full flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-sm border-b border-cyan-400/20">
              <div className="jarvis-text text-lg">Painel Jarvis</div>
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full jarvis-glow" />
                )}
                <span className="text-cyan-100">{user.user_metadata?.name || user.email}</span>
                <form action="/logout" method="post">
                  <button type="submit" className="ml-4 text-sm text-cyan-400 hover:text-cyan-300 transition">Sair</button>
                </form>
              </div>
            </header>
          )}
          <div className="p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
