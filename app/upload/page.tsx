import React, { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'

const openaiKey = process.env.OPENAI_API_KEY;


export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult('')
    setErro('')
    setLoading(true)
    try {
      if (f.type.startsWith('audio/')) {
        // Transcrição com Whisper
        const formData = new FormData()
        formData.append('file', f)
        formData.append('model', 'whisper-1')
        formData.append('language', 'pt')
        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`

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
    } catch (e) {
      setErro('Erro ao processar o arquivo.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 rounded-2xl bg-[#101c2c] border border-cyan-400/20 shadow-lg flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-green-300 font-bold text-2xl">
        <Upload size={32} /> Upload Inteligente
      </div>
      <input
        type="file"
        className="text-cyan-100"
        onChange={handleUpload}
        accept="audio/*,image/*,application/pdf"
      />
      {loading && <Loader2 className="animate-spin text-green-400" />}
      <div className="text-green-100 text-sm whitespace-pre-line min-h-[48px] w-full">
        {erro ? <span className="text-red-400">{erro}</span> : result}
      </div>
    </div>
  )
} 