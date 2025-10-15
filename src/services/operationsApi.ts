import { api } from "./api";
import type { Operation } from "../types";

export interface OperationFilters {
  from?: string;
  to?: string;
  category_id?: number;
  type?: "income" | "expense";
  q?: string;
  tags?: string;
}

export interface CreateOperationRequest {
  category_id: number;
  type: "income" | "expense";
  transaction: number;
  date?: string;
  description?: string;
  tags?: string;
  is_recurring?: boolean;
  recurring_frequency?: "daily" | "weekly" | "monthly" | "yearly";
  recurring_end_date?: string;
}

export interface UpdateOperationRequest extends Partial<CreateOperationRequest> {
  id: number;
}

const mapParams = (params: OperationFilters | undefined) => {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );
};

export const operationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOperations: builder.query<Operation[], OperationFilters | void>({
      query: (params) => ({
        url: "/operations",
        params: mapParams(params as OperationFilters | undefined),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ operation_id }) => ({
                type: "Operations" as const,
                id: operation_id,
              })),
              { type: "Operations" as const, id: "LIST" },
            ]
          : [{ type: "Operations" as const, id: "LIST" }],
    }),
    createOperation: builder.mutation<Operation, CreateOperationRequest>({
      query: (payload) => ({
        url: "/operations",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Operations", id: "LIST" }],
    }),
    updateOperation: builder.mutation<Operation, UpdateOperationRequest>({
      query: ({ id, ...patch }) => ({
        url: `/operations/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Operations", id },
        { type: "Operations", id: "LIST" },
      ],
    }),
    deleteOperation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/operations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Operations", id },
        { type: "Operations", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOperationsQuery,
  useCreateOperationMutation,
  useUpdateOperationMutation,
  useDeleteOperationMutation,
} = operationsApi;
