'use client'

import { createContext, useEffect, useMemo, useState } from "react";
import { AuthenticatedUser } from "../types";
import { deleteCookie, setCookie } from "cookies-next";
import jwt from "jsonwebtoken";
import { getCookie } from "../_utils";

interface AuthContextProps {
  user: AuthenticatedUser | null;
  authLoaded: boolean;
  registerToken: (token: string) => void;
  cleanToken: () => void;
}

interface AuthContextProviderProps {
  children: React.ReactNode;
}

const DEFAULT_VALUES: AuthContextProps = {
  user: null,
  authLoaded: false,
  registerToken: (_: string) => {},
  cleanToken: () => {},
};

export const AuthContext = createContext<AuthContextProps>(DEFAULT_VALUES);

export const AuthProvider = ({ children }: AuthContextProviderProps) => {
  const JWT_TOKEN_COOKIE_KEY = 'shaveup_access_token';

  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const registerToken = (token: string) => {
    setCookie(JWT_TOKEN_COOKIE_KEY, token);

    const decodedUser = jwt.decode(token) as AuthenticatedUser;
    setUser(decodedUser);
  }

  const cleanToken = () => {
    deleteCookie(JWT_TOKEN_COOKIE_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    authLoaded,
    registerToken,
    cleanToken,
  }), [user, authLoaded])

  useEffect(() => {
    const token = getCookie(JWT_TOKEN_COOKIE_KEY);

    if (token) {
      const decodedUser = jwt.decode(token) as AuthenticatedUser;
      setUser(decodedUser);
    };

    setAuthLoaded(true);
  }, []);

  return (
    <AuthContext.Provider
      value={value}
    >{children}</AuthContext.Provider>
  )
}
