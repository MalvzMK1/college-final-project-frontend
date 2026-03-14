'use client'

import { useContext, useEffect } from "react"
import { AuthContext } from "../_contexts"
import { UserTypesEnum } from "../types";
import { useRouter } from "next/navigation";
import { Fab } from "@mui/material";

export default function Admin() {
  const router = useRouter();
  const { authLoaded, user, cleanToken } = useContext(AuthContext);

  useEffect(() => {
    if (!authLoaded) return;

    if (authLoaded && !user) {
      router.push('/login');
    }

    if (user?.roleId !== UserTypesEnum.BARBER) {
      router.push('../');
    }
  }, [user, authLoaded])

  const logout = () => {
    cleanToken();
    router.push('/login');
  }

  if (!user) return <></>

  return (
    <div
      className={"relative block w-screen h-screen"}
    >
      <h1>Tela do Admin</h1>
      <Fab
        color="primary"
        variant={'extended'}
        size={'large'}
        aria-label="logout"
        style={{position: "absolute"}}
        className={"right-4 top-4"}
        onClick={logout}
      >Logout</Fab>
    </div>
  )
}
