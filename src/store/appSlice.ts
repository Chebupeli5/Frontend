import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  AppState,
  Category,
  CategoryLimit,
  SavingsAccount,
  Asset,
  FinancialGoal,
  Loan,
  Operation,
  Notification,
} from "../types";
import {
  mockCategories,
  mockCategoryLimits,
  mockSavingsAccounts,
  mockAssets,
  mockFinancialGoals,
  mockLoans,
  mockOperations,
  mockReports,
  mockNotifications,
  mockUsers,
} from "../data/mockData";

const initialState: AppState = {
  users: mockUsers,
  categories: mockCategories,
  categoryLimits: mockCategoryLimits,
  savingsAccounts: mockSavingsAccounts,
  assets: mockAssets,
  financialGoals: mockFinancialGoals,
  loans: mockLoans,
  operations: mockOperations,
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
        (cl) =>
          cl.user_id === action.payload.user_id &&
          cl.category_id === action.payload.category_id
      );
      if (existingIndex !== -1) {
        state.categoryLimits[existingIndex] = action.payload;
      } else {
        state.categoryLimits.push(action.payload);
      }
    },
    deleteCategoryLimit: (
      state,
      action: PayloadAction<{ user_id: number; category_id: number }>
    ) => {
      state.categoryLimits = state.categoryLimits.filter(
        (cl) =>
          !(
            cl.user_id === action.payload.user_id &&
            cl.category_id === action.payload.category_id
          )
      );
    },

    // Savings Accounts
    addSavingsAccount: (state, action: PayloadAction<SavingsAccount>) => {
      state.savingsAccounts.push(action.payload);
    },
    updateSavingsAccount: (state, action: PayloadAction<SavingsAccount>) => {
      const index = state.savingsAccounts.findIndex(
        (sa) =>
          sa.user_id === action.payload.user_id &&
          sa.saving_name === action.payload.saving_name
      );
      if (index !== -1) {
        state.savingsAccounts[index] = action.payload;
      }
    },
    deleteSavingsAccount: (
      state,
      action: PayloadAction<{ user_id: number; saving_name: string }>
    ) => {
      state.savingsAccounts = state.savingsAccounts.filter(
        (sa) =>
          !(
            sa.user_id === action.payload.user_id &&
            sa.saving_name === action.payload.saving_name
          )
      );
    },

    // Assets
    addAsset: (state, action: PayloadAction<Asset>) => {
      state.assets.push(action.payload);
    },
    updateAsset: (state, action: PayloadAction<Asset>) => {
      const index = state.assets.findIndex(
        (a) =>
          a.user_id === action.payload.user_id && a.name === action.payload.name
      );
      if (index !== -1) {
        state.assets[index] = action.payload;
      }
    },
    deleteAsset: (
      state,
      action: PayloadAction<{ user_id: number; name: string }>
    ) => {
      state.assets = state.assets.filter(
        (a) =>
          !(
            a.user_id === action.payload.user_id &&
            a.name === action.payload.name
          )
      );
    },

    // Financial Goals
    addFinancialGoal: (state, action: PayloadAction<FinancialGoal>) => {
      state.financialGoals.push(action.payload);
    },
    updateFinancialGoal: (state, action: PayloadAction<FinancialGoal>) => {
      const index = state.financialGoals.findIndex(
        (fg) =>
          fg.user_id === action.payload.user_id &&
          fg.goal_name === action.payload.goal_name
      );
      if (index !== -1) {
        state.financialGoals[index] = action.payload;
      }
    },
    deleteFinancialGoal: (
      state,
      action: PayloadAction<{ user_id: number; goal_name: string }>
    ) => {
      state.financialGoals = state.financialGoals.filter(
        (fg) =>
          !(
            fg.user_id === action.payload.user_id &&
            fg.goal_name === action.payload.goal_name
          )
      );
    },

    // Loans
    addLoan: (state, action: PayloadAction<Loan>) => {
      state.loans.push(action.payload);
    },
    updateLoan: (state, action: PayloadAction<Loan>) => {
      const index = state.loans.findIndex(
        (l) =>
          l.user_id === action.payload.user_id &&
          l.credit_name === action.payload.credit_name
      );
      if (index !== -1) {
        state.loans[index] = action.payload;
      }
    },
    deleteLoan: (
      state,
      action: PayloadAction<{ user_id: number; credit_name: string }>
    ) => {
      state.loans = state.loans.filter(
        (l) =>
          !(
            l.user_id === action.payload.user_id &&
            l.credit_name === action.payload.credit_name
          )
      );
    },

    // Operations
    addOperation: (state, action: PayloadAction<Operation>) => {
      state.operations.push(action.payload);
      // Update category balance
      const category = state.categories.find(
        (c) => c.category_id === action.payload.category_id
      );
      if (category) {
        category.balance += action.payload.transaction;
      }
    },
    deleteOperation: (state, action: PayloadAction<number>) => {
      const operation = state.operations.find(
        (o) => o.operation_id === action.payload
      );
      if (operation) {
        // Revert category balance
        const category = state.categories.find(
          (c) => c.category_id === operation.category_id
        );
        if (category) {
          category.balance -= operation.transaction;
        }
        state.operations = state.operations.filter(
          (o) => o.operation_id !== action.payload
        );
      }
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
  addSavingsAccount,
  updateSavingsAccount,
  deleteSavingsAccount,
  addAsset,
  updateAsset,
  deleteAsset,
  addFinancialGoal,
  updateFinancialGoal,
  deleteFinancialGoal,
  addLoan,
  updateLoan,
  deleteLoan,
  addOperation,
  deleteOperation,
  addNotification,
  deleteNotification,
} = appSlice.actions;

export default appSlice.reducer;
