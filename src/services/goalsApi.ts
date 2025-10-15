import { api } from "./api";
import type { FinancialGoal } from "../types";

export interface CreateGoalRequest {
  goal_name: string;
  goal: number;
  description?: string;
  target_date?: string;
  priority?: "low" | "medium" | "high";
  category?: string;
  current_amount?: number;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  id: number;
  current_amount?: number;
  is_completed?: boolean;
}

export interface GoalsSummary {
  total_goals: number;
  completed_goals: number;
  active_goals: number;
  total_target_amount: number;
  total_current_amount: number;
  completion_rate: number;
  average_goal_amount: number;
  priority_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  overdue_goals: number;
}

export const goalsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGoals: builder.query<FinancialGoal[], void>({
      query: () => "/goals",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Goals" as const, id })),
              { type: "Goals" as const, id: "LIST" },
              { type: "Goals" as const, id: "SUMMARY" },
            ]
          : [
              { type: "Goals" as const, id: "LIST" },
              { type: "Goals" as const, id: "SUMMARY" },
            ],
    }),
    createGoal: builder.mutation<FinancialGoal, CreateGoalRequest>({
      query: (payload) => ({
        url: "/goals",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Goals", id: "LIST" },
        { type: "Goals", id: "SUMMARY" },
      ],
    }),
    updateGoal: builder.mutation<FinancialGoal, UpdateGoalRequest>({
      query: ({ id, ...patch }) => ({
        url: `/goals/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Goals", id },
        { type: "Goals", id: "LIST" },
        { type: "Goals", id: "SUMMARY" },
      ],
    }),
    deleteGoal: builder.mutation<void, number>({
      query: (id) => ({
        url: `/goals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Goals", id },
        { type: "Goals", id: "LIST" },
        { type: "Goals", id: "SUMMARY" },
      ],
    }),
    getGoalsSummary: builder.query<GoalsSummary, void>({
      query: () => "/goals/analytics/summary",
      providesTags: [{ type: "Goals" as const, id: "SUMMARY" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useGetGoalsSummaryQuery,
} = goalsApi;
