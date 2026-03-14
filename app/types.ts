export type HttpResponse<T = undefined> = Partial<{
  data: T;
  message: string;
}>;

export enum UserTypesEnum {
  BARBER = 1,
  CUSTOMER = 2,
}

export type AuthenticatedUser = {
  id: string;
  roleId: UserTypesEnum;
}
