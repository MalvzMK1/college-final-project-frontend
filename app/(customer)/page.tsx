'use client'

import { useContext, useEffect } from "react"
import { useRouter } from "next/navigation";
import { AuthContext } from "../_contexts";

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
    <p>Tela do cliente</p>
  )
}
