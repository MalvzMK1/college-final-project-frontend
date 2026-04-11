'use client'

import { useContext, useEffect } from "react"
import { AuthContext } from "../_contexts"
import { UserTypesEnum } from "../types";
import { useRouter } from "next/navigation";

export default function Admin() {
  const router = useRouter();
  const { authLoaded, user } = useContext(AuthContext);

  useEffect(() => {
    if (!authLoaded) return;

    if (authLoaded && !user) {
      router.push('/login');
    }

    if (user?.roleId !== UserTypesEnum.BARBER) {
      router.push('../');
    }
  }, [user, authLoaded])

  if (!user) return <></>

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-primary">Painel do Administrador</h1>
      <main>
        Tela do admin
      </main>
    </div>
  )
}
