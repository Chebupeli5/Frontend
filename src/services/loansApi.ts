import { api } from "./api";
import type { Loan } from "../types";

export interface LoanPayload {
  credit_name: string;
  loan_balance: number;
  loan_payment: number;
  payment_date: string;
}

export interface LoanScheduleEntry {
  installment: number;
  amount: number;
  due: string;
}

export const loansApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLoans: builder.query<Loan[], void>({
      query: () => "/loans",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Loans" as const, id })),
              { type: "Loans" as const, id: "LIST" },
            ]
          : [{ type: "Loans" as const, id: "LIST" }],
    }),
    createLoan: builder.mutation<Loan, LoanPayload>({
      query: (payload) => ({
        url: "/loans",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Loans", id: "LIST" }],
    }),
    updateLoan: builder.mutation<Loan, { id: number; body: Partial<LoanPayload> }>(
      {
        query: ({ id, body }) => ({
          url: `/loans/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "Loans", id },
          { type: "Loans", id: "LIST" },
        ],
      }
    ),
    deleteLoan: builder.mutation<void, number>({
      query: (id) => ({
        url: `/loans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Loans", id },
        { type: "Loans", id: "LIST" },
      ],
    }),
    getLoanSchedule: builder.query<{ schedule: LoanScheduleEntry[] }, number>({
      query: (id) => `/loans/schedule/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Loans", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLoansQuery,
  useCreateLoanMutation,
  useUpdateLoanMutation,
  useDeleteLoanMutation,
  useGetLoanScheduleQuery,
} = loansApi;
