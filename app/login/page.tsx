import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="bg-card rounded-lg shadow p-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold mb-2">Entrar no Painel Jarvis</h1>
        <button
          onClick={handleGoogleLogin}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition"
        >
          Entrar com Google
        </button>
      </div>
    </main>
  )
} 