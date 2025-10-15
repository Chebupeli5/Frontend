import { api } from "./api";
import type { Category, CategoryLimit } from "../types";

export type CategoryResponse = Category & { limit?: number | null };

export interface CreateCategoryRequest {
  name: string;
  balance?: number;
  user_id?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number;
  limit?: number | null;
}

export interface CreateCategoryLimitRequest {
  category_id: number;
  limit: number;
  user_id?: number;
}

export interface UpdateCategoryLimitRequest
  extends Partial<CreateCategoryLimitRequest> {
  id: number;
}

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse[], void>({
      query: () => "/categories",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ category_id }) => ({
                type: "Categories" as const,
                id: category_id,
              })),
              { type: "Categories" as const, id: "LIST" },
            ]
          : [{ type: "Categories" as const, id: "LIST" }],
    }),
    createCategory: builder.mutation<CategoryResponse, CreateCategoryRequest>({
      query: (payload) => ({
        url: "/categories",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Categories", id: "LIST" },
        { type: "CategoryLimits", id: "LIST" },
      ],
    }),
    updateCategory: builder.mutation<CategoryResponse, UpdateCategoryRequest>({
      query: ({ id, ...patch }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Categories", id },
        { type: "Categories", id: "LIST" },
        { type: "CategoryLimits", id: "LIST" },
      ],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Categories", id },
        { type: "Categories", id: "LIST" },
        { type: "CategoryLimits", id: "LIST" },
      ],
    }),
    getCategoryLimits: builder.query<CategoryLimit[], void>({
      query: () => "/categories/limits",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "CategoryLimits" as const,
                id,
              })),
              { type: "CategoryLimits" as const, id: "LIST" },
            ]
          : [{ type: "CategoryLimits" as const, id: "LIST" }],
    }),
    createCategoryLimit: builder.mutation<
      CategoryLimit,
      CreateCategoryLimitRequest
    >({
      query: (payload) => ({
        url: "/categories/limits",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "CategoryLimits", id: "LIST" }],
    }),
    updateCategoryLimit: builder.mutation<
      CategoryLimit,
      UpdateCategoryLimitRequest
    >({
      query: ({ id, ...patch }) => ({
        url: `/categories/limits/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CategoryLimits", id },
        { type: "CategoryLimits", id: "LIST" },
      ],
    }),
    deleteCategoryLimit: builder.mutation<void, number>({
      query: (id) => ({
        url: `/categories/limits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "CategoryLimits", id },
        { type: "CategoryLimits", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryLimitsQuery,
  useCreateCategoryLimitMutation,
  useUpdateCategoryLimitMutation,
  useDeleteCategoryLimitMutation,
} = categoriesApi;
