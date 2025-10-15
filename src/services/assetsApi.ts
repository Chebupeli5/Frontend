import { api } from "./api";
import type { Asset } from "../types";

export interface CreateAssetRequest {
  name: string;
  balance?: number;
  user_id?: number;
}

export interface UpdateAssetRequest {
  id: number;
  name?: string;
  balance?: number;
}

export const assetsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query<Asset[], void>({
      query: () => "/finance/assets",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Assets" as const, id })),
              { type: "Assets" as const, id: "LIST" },
            ]
          : [{ type: "Assets" as const, id: "LIST" }],
    }),
    createAsset: builder.mutation<Asset, CreateAssetRequest>({
      query: (payload) => ({
        url: "/finance/assets",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Assets", id: "LIST" }],
    }),
    updateAsset: builder.mutation<Asset, UpdateAssetRequest>({
      query: ({ id, ...patch }) => ({
        url: `/finance/assets/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Assets", id },
        { type: "Assets", id: "LIST" },
      ],
    }),
    deleteAsset: builder.mutation<void, number>({
      query: (id) => ({
        url: `/finance/assets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Assets", id },
        { type: "Assets", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAssetsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = assetsApi;
