import axios from "axios";
import { GetAllUsersParams, GetAllUsersResponse, PatchTurnUserIntoBarber, PostUserLoginBody, PostUserLoginResponse, PostUserRegisterBody } from "./types";
import { HttpResponse } from "@/app/types";
import { getCookie } from "../../_utils";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function getToken(): string {
  const token = getCookie('shaveup_access_token');
  return token ? `Bearer ${token}` : '';
}

export const postUserLogin = (userObj: PostUserLoginBody) => {
  return axios.post<HttpResponse<PostUserLoginResponse>>(apiBaseUrl + '/auth/login', userObj);
};

export const postUserRegister = (userObj: PostUserRegisterBody) => {
  return axios.post(apiBaseUrl + '/auth/register', userObj);
};

export const getAllUsers = ({ 
  skip = 0,
  take = 20,
  ...params
}: GetAllUsersParams) => {
  return axios.get<HttpResponse<GetAllUsersResponse>>(apiBaseUrl + '/admin/user', {
    params: {
      ...params,
      skip,
      take,
    },
    headers: {
      Authorization: getToken(),
    }
  })
}

export const patchTurnUserIntoBarber = ({ userId }: PatchTurnUserIntoBarber) => {
  return axios.patch(apiBaseUrl + `/admin/user/${userId}/turn-into-barber`, {}, {
    headers: {
      Authorization: getToken(),
    },
  });
}
