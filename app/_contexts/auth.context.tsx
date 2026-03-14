import { createContext, useEffect, useState } from "react";
import { AuthenticatedUser } from "../types";
import { deleteCookie, setCookie } from "cookies-next";
import jwt from "jsonwebtoken";
import { getCookie } from "../_utils";

interface AuthContextProps {
  user: AuthenticatedUser | null;
  registerToken: (token: string) => void;
  cleanToken: () => void;
}

interface AuthContextProviderProps {
  children: React.ReactNode;
}

const DEFAULT_VALUES: AuthContextProps = {
  user: null,
  registerToken: (_: string) => {},
  cleanToken: () => {},
};

export const AuthContext = createContext<AuthContextProps>(DEFAULT_VALUES);

export const AuthProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const JWT_TOKEN_COOKIE_KEY = 'shaveup_access_token';

  const registerToken = async (token: string) => {
    setCookie(JWT_TOKEN_COOKIE_KEY, token);

    const decodedUser = jwt.decode(token) as AuthenticatedUser;
    setUser(decodedUser);
  }

  const cleanToken = () => {
    deleteCookie(JWT_TOKEN_COOKIE_KEY);
    setUser(null);
  }

  useEffect(() => {
    const token = getCookie(JWT_TOKEN_COOKIE_KEY);
    if (!token) return;

    const decodedUser = jwt.decode(token) as AuthenticatedUser;
    setUser(decodedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        registerToken,
        cleanToken,
      }}
    >{children}</AuthContext.Provider>
  )
}
