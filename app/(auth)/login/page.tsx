'use client'

import { useContext, useEffect, useState } from "react";
import { Button, FormControl, TextField } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFetch } from "@/app/_hooks";
import { HttpResponse, UserTypesEnum } from "@/app/types";
import { LoadingMask } from "@/app/_components";
import { AuthContext } from "@/app/_contexts";
import { postUserLogin, PostUserLoginResponse } from "@/app/_services";

export default function Login() {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email: string | null;
    password: string | null;
    request: string | null;
  }>({
    email: null,
    password: null,
    request: null,
  });

  const {
    response,
    error,
    isLoading,
    runFetch,
  } = useFetch<HttpResponse<PostUserLoginResponse>>();

  function validateInputs() {
    const newErrors = {
      email: null as string | null,
      password: null as string | null,
      request: null as string | null,
    };

    let isValid = true;

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

  function login() {
    const areInputsValid = validateInputs();

    if (!areInputsValid) return;

    runFetch(
      postUserLogin({
        email,
        password,
      })
    );
  }

  useEffect(() => {
    if (response?.data) {
      authContext.registerToken(response.data.token);

      if (response.data.userTypeId === UserTypesEnum.BARBER) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else if (error) {
      setErrors({
        ...errors,
        request: error.data.message,
      });
    }
  }, [response, error])

  return (
    <main className={'h-screen w-screen flex items-center justify-center bg-background'}>
      {isLoading && <LoadingMask />}

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
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            className={'w-full'}
            label={'Senha'}
            placeholder={'********'}
            type={'password'}
            onChange={(e) => setPassword(e.target.value)}
            variant={'filled'}
            error={!!errors.password}
            helperText={errors.password}
          />
        </FormControl>
        <Button
          className={'w-full'}
          variant={'contained'}
          onClick={login}
          disabled={isLoading}
        >
          Entrar
        </Button>
        {errors.request && <p className={'text-red-500'}>{errors.request}</p>}
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
