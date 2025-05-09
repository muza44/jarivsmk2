import React, { useState } from 'react'
import { Settings } from 'lucide-react'

export default function ConfigPage() {
  const [cidade, setCidade] = useState('Cotia')
  const [tema, setTema] = useState('dark')
  return (
    <div className="max-w-xl mx-auto mt-12 p-8 rounded-2xl bg-[#101c2c] border border-cyan-400/20 shadow-lg flex flex-col gap-6 items-center">
      <div className="flex items-center gap-2 text-cyan-300 font-bold text-2xl">
        <Settings size={32} /> Configurações Jarvis
      </div>
      <div className="flex flex-col gap-4 w-full">
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
      <div className="text-cyan-400 text-xs mt-2">Persistência e integração real em breve</div>
    </div>
  )
} 