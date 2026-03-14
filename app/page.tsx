'use client'

import { useContext, useEffect } from "react"
import { AuthContext } from "./_contexts"
import { useRouter } from "next/navigation";
import { Fab } from "@mui/material";

export default function Home() {
  const router = useRouter();

  const { authLoaded, user, cleanToken } = useContext(AuthContext);

  useEffect(() => {
    if (authLoaded && !user) {
      router.push('/login')
    }
  }, [authLoaded, user])

  const logout = () => {
    cleanToken();
    router.push('/login');
  }

  if (!user) return <></>

  return (
    <div
      className={"relative block w-screen h-screen"}
    >
      <h1>Tela do Cliente</h1>
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
