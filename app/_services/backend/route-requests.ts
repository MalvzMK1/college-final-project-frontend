import axios from "axios";
import { PostUserLoginBody, PostUserLoginResponse, PostUserRegisterBody } from "./types";
import { HttpResponse } from "@/app/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const postUserLogin = (userObj: PostUserLoginBody) => {
  return axios.post<HttpResponse<PostUserLoginResponse>>(apiBaseUrl + '/auth/login', userObj);
};

export const postUserRegister = (userObj: PostUserRegisterBody) => {
  return axios.post(apiBaseUrl + '/auth/register', userObj);
};
