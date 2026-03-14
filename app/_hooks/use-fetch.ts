import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";

export const useFetch = <Res = any>() => {
  const [response, setResponse] = useState<Res | null>(null);
  const [error, setError] = useState<{ data: any } | any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cr = () => setResponse(null);
  const ce = () => setError(null);
  const fn = async (apiPromise: Promise<AxiosResponse>) => {
    if (!apiPromise) return;

    try {
      setResponse(null);
      setError(null);
      setIsLoading(true);
      const response = await apiPromise;
      setResponse(response.data);
    } catch (err: any) {
      if (!err.response)
        return setError({
          data: { message: 'Erro de servidor' },
        });

      setError(err.response);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResponse = useCallback(cr, []);
  const clearError = useCallback(ce, []);
  const runFetch = useCallback(fn, []);

  return { response, error, isLoading, runFetch, clearResponse, clearError };
};

export const useFetchNoReturnContent = () => {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cr = () => setResponse(null);
  const ce = () => setError(null);
  const fn = async (apiPromise: Promise<AxiosResponse>) => {
    if (!apiPromise) return;

    try {
      setIsLoading(true);
      const response = await apiPromise;

      if (response.status >= 200 && response.status <= 299)
        setResponse(response);
    } catch (err: any) {
      if (!err.response)
        return setError({
          data: { message: 'Erro de servidor' },
        });

      setError(err.response);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResponse = useCallback(cr, []);
  const clearError = useCallback(ce, []);
  const runFetch = useCallback(fn, []);

  return { response, error, isLoading, runFetch, clearResponse, clearError };
};
