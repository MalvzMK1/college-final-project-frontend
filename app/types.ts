export type HttpResponse<T = undefined> = Partial<{
  data: T;
  message: string;
}>;
