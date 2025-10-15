import { api } from "./api";
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    login: string;
    visualname: string;
    role: string;
  };
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface SignupRequest {
  login: string;
  password: string;
  visualname: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (payload) => ({
        url: "/auth/signup",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<void, { refreshToken: string }>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useSignupMutation, useLogoutMutation } = authApi;
