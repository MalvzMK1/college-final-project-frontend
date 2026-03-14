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

    if (user?.roleId !== UserTypesEnum.BARBER) {
      router.push('../');
    }
  }, [user, authLoaded])

  return <h1>Tela do Admin</h1>
}
