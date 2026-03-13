'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, FormControl, TextField } from "@mui/material";
import { postUserRegister } from "@/app/_services/backend/route-requests";
import { HttpResponse } from "@/app/types";
import { useFetch } from "@/app/_hooks";
import { LoadingMask } from "@/app/_components/loading-mask";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    name: string | null;
    email: string | null;
    password: string | null;
    request: string | null;
  }>({
    name: null,
    email: null,
    password: null,
    request: null,
  });

  const {
    response,
    error,
    isLoading,
    runFetch,
  } = useFetch<HttpResponse>();

  function validateInputs() {
    const newErrors = {
      name: null as string | null,
      email: null as string | null,
      password: null as string | null,
      request: null as string | null,
    };

    let isValid = true;

    if (name.length < 3) {
      newErrors.name = 'O nome tem que ter mais de 3 caracteres';
      isValid = false;
    }

    if (!email.length || !email.includes('@')) {
      newErrors.email = 'E-mail inválido';
      isValid = false;
    }

    if (password?.length < 8) {
      newErrors.password = 'A senha precisa ter no mínimo 8 caracteres';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  }

  function register() {
    const areInputsValid = validateInputs();
    console.log(areInputsValid)

    if (!areInputsValid) return;

    runFetch(
      postUserRegister({
        name,
        email,
        password,
      })
    );
  }

  useEffect(() => {
    if (response) {
      router.push('/login');
    } else if (error) {
      setErrors({
        ...errors,
        request: error.data.message,
      });
    }
  }, [response, error, isLoading])

  useEffect(() => {
    console.log(errors);
  }, [errors])

  return (
    <main className={'h-screen w-screen flex items-center justify-center bg-background'}>
      {isLoading && <LoadingMask />}

      <div className={'p-12 flex flex-col items-center justify-center rounded-lg bg-white gap-4 w-1/4'}>
        <h1 className={'text-2xl self-end font-bold'}>
          Cadastro
        </h1>

        <FormControl className={'flex flex-col items-center justify center gap-2 w-full'}>
          <TextField
            className={'w-full'}
            label={'Nome'}
            placeholder={'John Doe'}
            type={'text'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant={'filled'}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            className={'w-full'}
            label={'E-mail'}
            placeholder={'your-email@mail.com'}
            type={'email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant={'filled'}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            className={'w-full'}
            label={'Senha'}
            placeholder={'********'}
            type={'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant={'filled'}
            error={!!errors.password}
            helperText={errors.password}
          />
        </FormControl>
        <Button
          className={'w-full'}
          variant={'contained'}
          onClick={register}
          disabled={isLoading}
        >
          Registrar
        </Button>
         {errors.request && <p className={'text-red-500'}>{errors.request}</p>}
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
