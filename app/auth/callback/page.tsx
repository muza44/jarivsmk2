import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    async function finishLogin() {
      await supabase.auth.getSession()
      router.replace('/')
    }
    finishLogin()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <span className="text-lg">Finalizando login...</span>
    </main>
  )
} 