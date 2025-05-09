import React from 'react'
import { Calendar } from 'lucide-react'

const compromissos = [
  { hora: '10:00', evento: 'Reunião com equipe' },
  { hora: '14:00', evento: 'Call com cliente' },
  { hora: '16:30', evento: 'Revisão de código' }
]

export default function AgendaPage() {
  return (
    <div className="max-w-xl mx-auto mt-12 p-8 rounded-2xl bg-[#101c2c] border border-cyan-400/20 shadow-lg flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-cyan-300 font-bold text-2xl">
        <Calendar size={32} /> Agenda do Dia
      </div>
      <ul className="w-full text-cyan-100 text-sm">
        {compromissos.map((c, i) => (
          <li key={i} className="flex justify-between border-b border-cyan-400/10 py-2">
            <span>{c.hora}</span>
            <span>{c.evento}</span>
          </li>
        ))}
      </ul>
      <div className="text-cyan-400 text-xs mt-2">Integração real com Google Calendar em breve</div>
    </div>
  )
} 