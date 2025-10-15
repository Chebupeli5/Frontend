import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppState, Loan, Notification } from "../types";
import {
  mockLoans,
  mockReports,
  mockNotifications,
  mockUsers,
} from "../data/mockData";

const initialState: AppState = {
  users: mockUsers,
  assets: [],
  loans: mockLoans,
  reports: mockReports,
  notifications: mockNotifications,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
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
  addLoan,
  updateLoan,
  deleteLoan,
  addNotification,
  deleteNotification,
} = appSlice.actions;

export default appSlice.reducer;
