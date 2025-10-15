import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  AppState,
  Category,
  CategoryLimit,
  Asset,
  FinancialGoal,
  Loan,
  Notification,
} from "../types";
import {
  mockCategories,
  mockCategoryLimits,
  mockAssets,
  mockFinancialGoals,
  mockLoans,
  mockReports,
  mockNotifications,
  mockUsers,
} from "../data/mockData";

const initialState: AppState = {
  users: mockUsers,
  categories: mockCategories,
  categoryLimits: mockCategoryLimits,
  assets: mockAssets,
  financialGoals: mockFinancialGoals,
  loans: mockLoans,
  reports: mockReports,
  notifications: mockNotifications,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Categories
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(
        (c) => c.category_id === action.payload.category_id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (state, action: PayloadAction<number>) => {
      state.categories = state.categories.filter(
        (c) => c.category_id !== action.payload
      );
    },

    // Category Limits
    addCategoryLimit: (state, action: PayloadAction<CategoryLimit>) => {
      const existingIndex = state.categoryLimits.findIndex(
        (cl) => cl.category_id === action.payload.category_id
      );
      if (existingIndex !== -1) {
        state.categoryLimits[existingIndex] = action.payload;
      } else {
        state.categoryLimits.push(action.payload);
      }
    },
    deleteCategoryLimit: (state, action: PayloadAction<number>) => {
      state.categoryLimits = state.categoryLimits.filter(
        (cl) => cl.category_id !== action.payload
      );
    },

    // Assets
    addAsset: (state, action: PayloadAction<Asset>) => {
      state.assets.push(action.payload);
    },
    updateAsset: (state, action: PayloadAction<Asset>) => {
      const index = state.assets.findIndex(
        (a) => a.name === action.payload.name
      );
      if (index !== -1) {
        state.assets[index] = action.payload;
      }
    },
    deleteAsset: (state, action: PayloadAction<string>) => {
      state.assets = state.assets.filter((a) => a.name !== action.payload);
    },

    // Financial Goals
    addFinancialGoal: (state, action: PayloadAction<FinancialGoal>) => {
      state.financialGoals.push(action.payload);
    },
    updateFinancialGoal: (state, action: PayloadAction<FinancialGoal>) => {
      const index = state.financialGoals.findIndex(
        (fg) => fg.goal_name === action.payload.goal_name
      );
      if (index !== -1) {
        state.financialGoals[index] = action.payload;
      }
    },
    deleteFinancialGoal: (state, action: PayloadAction<string>) => {
      state.financialGoals = state.financialGoals.filter(
        (fg) => fg.goal_name !== action.payload
      );
    },

    // Loans
    addLoan: (state, action: PayloadAction<Loan>) => {
      state.loans.push(action.payload);
    },
    updateLoan: (state, action: PayloadAction<Loan>) => {
      const index = state.loans.findIndex(
        (l) => l.credit_name === action.payload.credit_name
      );
      if (index !== -1) {
        state.loans[index] = action.payload;
      }
    },
    deleteLoan: (state, action: PayloadAction<string>) => {
      state.loans = state.loans.filter(
        (l) => l.credit_name !== action.payload
      );
    },
    // Notifications
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    deleteNotification: (state, action: PayloadAction<number>) => {
      state.notifications.splice(action.payload, 1);
    },
  },
});

export const {
  addCategory,
  updateCategory,
  deleteCategory,
  addCategoryLimit,
  deleteCategoryLimit,
  addAsset,
  updateAsset,
  deleteAsset,
  addFinancialGoal,
  updateFinancialGoal,
  deleteFinancialGoal,
  addLoan,
  updateLoan,
  deleteLoan,
  addNotification,
  deleteNotification,
} = appSlice.actions;

export default appSlice.reducer;
