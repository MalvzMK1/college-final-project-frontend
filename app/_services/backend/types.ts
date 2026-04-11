import { UserTypesEnum } from "@/app/types";

export interface PostUserLoginBody {
  email: string;
  password: string;
}

export interface PostUserLoginResponse {
  token: string;
  userTypeId: UserTypesEnum;
}

export interface PostUserRegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface GetAllUsersParams {
  name?: string;
  userTypeId?: UserTypesEnum;
  skip?: number;
  take?: number;
}

export interface GetAllUsersResponse {
  users: {
    id: string;
    name: string;
    userTypeId: UserTypesEnum;
    scheduledAppointmentsAmmount: number;
    ownedAppointmentsAmmount: number;
  }[];
  totalCount: number;
}

export interface PatchTurnUserIntoBarber {
  userId: string;
}
