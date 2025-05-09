import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = 'eb9aaf4f1e152ac66526071e7c3d8656' // Chave real fornecida
  const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?regions=us&markets=h2h&apiKey=${apiKey}`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json({ error: 'Erro ao buscar odds' }, { status: 500 })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao buscar odds' }, { status: 500 })
  }
} 