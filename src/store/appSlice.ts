import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  AppState,
  Asset,
  FinancialGoal,
  Loan,
  Notification,
} from "../types";
import {
  mockAssets,
  mockFinancialGoals,
  mockLoans,
  mockReports,
  mockNotifications,
  mockUsers,
} from "../data/mockData";

const initialState: AppState = {
  users: mockUsers,
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
