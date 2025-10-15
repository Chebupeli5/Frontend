import { api } from "./api";
import type { SavingsAccount } from "../types";

export interface CreateSavingsAccountRequest {
  saving_name: string;
  balance?: number;
  interest_rate?: number;
  user_id?: number;
}

export interface UpdateSavingsAccountRequest {
  id: number;
  saving_name?: string;
  balance?: number;
  interest_rate?: number;
}

export const savingsAccountsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSavingsAccounts: builder.query<SavingsAccount[], void>({
      query: () => "/savings_accounts",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "SavingsAccounts" as const,
                id,
              })),
              { type: "SavingsAccounts" as const, id: "LIST" },
            ]
          : [{ type: "SavingsAccounts" as const, id: "LIST" }],
    }),
    createSavingsAccount: builder.mutation<
      SavingsAccount,
      CreateSavingsAccountRequest
    >({
      query: (payload) => ({
        url: "/savings_accounts",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "SavingsAccounts", id: "LIST" }],
    }),
    updateSavingsAccount: builder.mutation<
      SavingsAccount,
      UpdateSavingsAccountRequest
    >({
      query: ({ id, ...patch }) => ({
        url: `/savings_accounts/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SavingsAccounts", id },
        { type: "SavingsAccounts", id: "LIST" },
      ],
    }),
    deleteSavingsAccount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/savings_accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "SavingsAccounts", id },
        { type: "SavingsAccounts", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSavingsAccountsQuery,
  useCreateSavingsAccountMutation,
  useUpdateSavingsAccountMutation,
  useDeleteSavingsAccountMutation,
} = savingsAccountsApi;
