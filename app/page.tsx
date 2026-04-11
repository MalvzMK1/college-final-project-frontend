'use client'

import { useContext, useEffect } from "react"
import { AuthContext } from "./_contexts"
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const { authLoaded, user } = useContext(AuthContext);

  useEffect(() => {
    if (authLoaded && !user) {
      router.push('/login')
    }
  }, [authLoaded, user])

  if (!user) return <></>

  return (
    <main className="h-screen w-full bg-background p-6 flex flex-col gap-4 overflow-y-auto">
      <h1 className="text-3xl font-bold text-white">Tela do Cliente</h1>
      <p className="text-gray-300">Bem-vindo ao sistema de gerenciamento de barbearia.</p>
    </main>
  )
}
