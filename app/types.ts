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

export enum AppointmentStatusEnum {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
  COMPLETED = 4,
  NO_SHOW = 5,
  CANCELED = 6,
}
