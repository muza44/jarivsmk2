import React, { useState } from 'react'
import { Play, Pause, ExternalLink } from 'lucide-react'

const mockTrack = {
  name: 'Blinding Lights',
  artist: 'The Weeknd',
  image: 'https://i.scdn.co/image/ab67616d0000b273e8b1b1b1b1b1b1b1b1b1b1b1',
  url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b'
}

export default function MusicaPage() {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="max-w-xl mx-auto mt-12 p-8 rounded-2xl bg-[#101c2c] border border-cyan-400/20 shadow-lg flex items-center gap-6">
      <img src={mockTrack.image} alt="cover" className="w-24 h-24 rounded-lg shadow" />
      <div className="flex-1">
        <div className="text-cyan-200 font-bold text-xl">{mockTrack.name}</div>
        <div className="text-cyan-100 text-sm mb-2">{mockTrack.artist}</div>
        <a href={mockTrack.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs flex items-center gap-1 hover:underline">
          Abrir no Spotify <ExternalLink size={14} />
        </a>
      </div>
      <button className="p-3 rounded-full bg-cyan-900 text-cyan-200" onClick={() => setPlaying(p => !p)} title={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={28} /> : <Play size={28} />}
      </button>
    </div>
  )
} 