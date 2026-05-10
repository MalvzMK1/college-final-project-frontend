import { AppointmentStatusEnum, UserTypesEnum } from "@/app/types";

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

export interface GetAvailableHoursResponse {
  days: {
    hours: {
      datetime: Date;
      isAvailable: boolean;
      availableBarbers: {
        id: string;
        name: string;
      }[];
    }[]
  }[]
}

export interface CreateAppointmentBody {
  barberId: string;
  dateTime: Date;
}

export interface UpdateScheduleStatusInput {
  barberId: string;
  appointmentId: number;
  statusId: AppointmentStatusEnum;
}

export interface GetWeekAppointmentsResponse {
  id: number;
  note: string | null;
  dateTime: Date;
  customerName: string;
  status: {
    id: number;
    name: string;
  } | null;
}
