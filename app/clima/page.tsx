import React, { useState } from 'react'
import { Sun, Loader2 } from 'lucide-react'

const API_KEY = 'SUA_API_KEY_OPENWEATHERMAP' // Troque pela sua chave real
const DEFAULT_CITY = 'Cotia'

export default function ClimaPage() {
  const [clima, setClima] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function fetchClima(city = DEFAULT_CITY) {
    setLoading(true)
    setErro('')
    setClima(null)
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`)
      if (!res.ok) throw new Error('Erro ao buscar clima')
      const data = await res.json()
      setClima(`${data.name}: ${data.weather[0].description}, ${Math.round(data.main.temp)}°C`)
    } catch (e) {
      setErro('Não foi possível obter o clima agora.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 rounded-2xl bg-[#101c2c] border border-cyan-400/20 shadow-lg flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-cyan-300 font-bold text-2xl">
        <Sun size={32} /> Clima Atual
      </div>
      <button
        className="bg-cyan-700/80 hover:bg-cyan-600/90 text-white px-6 py-2 rounded-lg font-semibold shadow-cyan-400/20 shadow transition"
        onClick={() => fetchClima()}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin inline" /> : 'Atualizar Clima'}
      </button>
      <div className="text-cyan-100 text-center min-h-[48px] text-lg">
        {clima || (erro ? <span className="text-red-400">{erro}</span> : 'Clique para ver o clima de hoje.')}
      </div>
    </div>
  )
} 