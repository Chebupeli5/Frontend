import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../types";

const storage =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : null;

const readStorageItem = (key: string) => storage?.getItem(key) ?? null;

const writeStorageItem = (key: string, value: string) => {
  storage?.setItem(key, value);
};

const removeStorageItem = (key: string) => {
  storage?.removeItem(key);
};

const storedUser = readStorageItem("currentUser");
const storedAccessToken = readStorageItem("accessToken");
const storedRefreshToken = readStorageItem("refreshToken");

interface AuthSuccessPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const initialState: AuthState = {
  isAuthenticated: Boolean(
    storedAccessToken && storedRefreshToken && storedUser
  ),
  currentUser: storedUser ? (JSON.parse(storedUser) as User) : null,
  loading: false,
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<AuthSuccessPayload>) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;

      writeStorageItem("currentUser", JSON.stringify(action.payload.user));
      writeStorageItem("accessToken", action.payload.accessToken);
      writeStorageItem("refreshToken", action.payload.refreshToken);
    },
    loginFailure: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;

      removeStorageItem("currentUser");
      removeStorageItem("accessToken");
      removeStorageItem("refreshToken");
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;

      removeStorageItem("currentUser");
      removeStorageItem("accessToken");
      removeStorageItem("refreshToken");
    },
    tokenReceived: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      writeStorageItem("accessToken", action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      writeStorageItem("currentUser", JSON.stringify(action.payload));
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  tokenReceived,
  updateUser,
} = authSlice.actions;
export default authSlice.reducer;
