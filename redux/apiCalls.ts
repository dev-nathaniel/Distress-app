import {
  registerStart,
  registerSuccess,
  registerFailure,
  User,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  loginStart,
  loginSucess,
  loginFailure,
  updateEmergencyContactsStart,
  updateEmergencyContactsFailure,
  updateEmergencyContactsSuccess,
} from "@/redux/slices/userSlice";
import { api } from "@/axios";
import { AppDispatch } from "./store";
import { AxiosError } from "axios";

export const register = async (dispatch: AppDispatch, user: User) => {
  dispatch(registerStart());
  try {
    const res = await api.post("/auth/register", user);
    dispatch(registerSuccess(res.data));
    console.log(res.data);
  } catch (err: any) {
    dispatch(registerFailure(err.message));
    throw new Error(err.message);
    console.log(err.message);
  }
};

export const login = async (dispatch: AppDispatch, user: User) => {
  dispatch(loginStart());
  try {
    const res = await api.post("/auth/login", user);
    dispatch(loginSucess(res.data));
    console.log(res.data);
    return res.data
  } catch (err: any) {
    dispatch(loginFailure(err.message));
    throw new Error(err.message);
    console.log(err.response.data);
  }
};

export const getEmergencyContacts = async (dispatch: AppDispatch, id: string, token: string) => {
  dispatch(updateEmergencyContactsStart())
  try {
    console.log('i am being called', token)
    const res = await api.get(`/user/${id}/emergencyContacts`, {headers: {Authorization: `Bearer ${token}`}})
    console.log(res.data)
    dispatch(updateEmergencyContactsSuccess(res.data.hasEmergencyContacts))
    console.log(res.data)
  } catch (error: any) {
    console.log(error.response)
    dispatch(updateEmergencyContactsFailure(error.message))
    throw new Error(error.message)
  }
}

export const logout = async (dispatch: AppDispatch) => {
  dispatch(logoutStart());
  try {
    dispatch(logoutSuccess(null));
  } catch (err: any) {
    dispatch(logoutFailure(err));
    throw new Error(err.message);
    console.log(err);
  }
};

export const updateUser = async (
  dispatch: AppDispatch,
  id: string | undefined,
  user: User
) => {
  dispatch(updateUserStart());
  try {
    const res = await api.put(`/user/${id}`, user);
    dispatch(updateUserSuccess(res.data));
    console.log(res.data);
  } catch (err: any) {
    dispatch(updateUserFailure(err.message));
    throw new Error(err.message);
    console.log(err.message);
  }
};
