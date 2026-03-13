'use client'

import { useState } from "react";
import Link from "next/link";
import { Button, FormControl, TextField } from "@mui/material";

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <main className={'h-screen w-screen flex items-center justify-center bg-background'}>
      <div className={'p-12 flex flex-col items-center justify-center rounded-lg bg-white gap-4 w-1/4'}>
        <h1 className={'text-2xl self-end font-bold mb-12'}>
          Cadastro
        </h1>

        <FormControl className={'flex flex-col items-center justify center gap-2 w-full'}>
          <TextField
            className={'w-full'}
            label={'Nome'}
            placeholder={'John Doe'}
            type={'text'}
            onChange={(e) => setName(e.target.value)}
            variant={'filled'}
          />
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
          onClick={() => alert(`name: ${name}, mail: ${email}, password: ${password}`)}
        >
          Entrar
        </Button>
        <p>
          Já tem uma conta?
          <Link 
            className={'font-semibold cursor-pointer'}
            href='../login/'
          > Entre</Link>
        </p>
      </div>
    </main>
  )
}
