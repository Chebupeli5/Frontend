import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../types";

const initialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload;
      state.loading = false;
    },
    loginFailure: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.loading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.loading = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
