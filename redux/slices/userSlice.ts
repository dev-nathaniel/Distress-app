import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type phoneNumber = {
  number: string;
  digits: string;
  countryCode: string;
};

type emergencyContact = {
  name: string;
  firstName: string;
  lastName: string;
  emails: [string];
  phoneNumbers: [phoneNumber];
};

export interface User {
  _id?: string;
  email: string;
  fullname: string;
  phoneNumber: string;
  password?: string;
  address: string;
  emergencyContacts?: [emergencyContact];
  sentEmergencies?: [string | null];
  receivedEmergencies?: [string | null];
}

export interface UserState {
  currentUser: {id: string, token: string} | null;
  emergencyContacts: boolean;
  isFetching: boolean;
  error: any;
}

const initialState: UserState = {
  currentUser: null,
  emergencyContacts: false,
  isFetching: false,
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    registerStart: (state) => {
      state.isFetching = true;
    },
    registerSuccess: (state, action) => {
      state.isFetching = false;
      state.error = null;
      state.currentUser = action.payload;
    },
    registerFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
      state.currentUser = null;
    },
    loginStart: (state) => {
      state.isFetching = true;
    },
    loginSucess: (state, action) => {
      state.isFetching = false;
      state.error = null;
      state.currentUser = action.payload;
    },
    loginFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
      state.currentUser = null;
    },
    logoutStart: (state) => {
      state.isFetching = true;
    },
    logoutSuccess: (state, action) => {
      state.isFetching = false;
      state.error = null;
      state.currentUser = action.payload;
    },
    logoutFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
    },
    updateEmergencyContactsStart: (state) => {
      state.isFetching = true
    },
    updateEmergencyContactsSuccess: (state, action) => {
      state.emergencyContacts = action.payload
      state.isFetching = false
      state.error = null
    },
    updateEmergencyContactsFailure: (state, action) => {
      state.error = action.payload
      state.isFetching = false
    },
    updateUserStart: (state) => {
      state.isFetching = true;
    },
    updateUserSuccess: (state, action) => {
      state.isFetching = false;
      state.error = null;
      state.currentUser = action.payload;
    },
    updateUserFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  registerStart,
  registerSuccess,
  registerFailure,
  loginStart,
  loginSucess,
  loginFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  updateEmergencyContactsFailure,
  updateEmergencyContactsStart,
  updateEmergencyContactsSuccess,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
} = userSlice.actions;

export default userSlice.reducer;
