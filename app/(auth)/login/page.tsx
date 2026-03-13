'use client'

import { useState } from "react";
import { Button, FormControl, TextField } from "@mui/material";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <main className={'h-screen w-screen flex items-center justify-center bg-background'}>
      <div className={'p-12 flex flex-col items-center justify-center rounded-lg bg-white gap-4 w-1/4'}>
        <h1 className={'text-2xl self-start font-bold'}>
          Login
        </h1>

        <FormControl className={'flex flex-col items-center justify center gap-2 w-full'}>
          <TextField
            className={'w-full'}
            label={'E-mail'}
            placeholder={'your-email@mail.com'}
            type={'email'}
            onChange={(e) => setEmail(e.target.value)}
            variant={'filled'}
          />
          <TextField
            className={'w-full'}
            label={'Senha'}
            placeholder={'********'}
            type={'password'}
            onChange={(e) => setPassword(e.target.value)}
            variant={'filled'}
          />
        </FormControl>
        <Button
          className={'w-full'}
          variant={'contained'}
          onClick={() => alert(`mail: ${email}, password: ${password}`)}
        >
          Entrar
        </Button>
        <p>
          Ainda não tem uma conta?
          <Link 
            className={'font-semibold cursor-pointer'}
            href='../register/'
          > Cadastre-se</Link>
        </p>
      </div>
    </main>
  )
}
