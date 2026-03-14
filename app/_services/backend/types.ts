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
