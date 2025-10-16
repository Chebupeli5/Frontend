import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppState, Notification } from "../types";
import { mockReports, mockNotifications, mockUsers } from "../data/mockData";

const initialState: AppState = {
  users: mockUsers,
  reports: mockReports,
  notifications: mockNotifications,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Notifications
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    deleteNotification: (state, action: PayloadAction<number>) => {
      state.notifications.splice(action.payload, 1);
    },
  },
});

export const { addNotification, deleteNotification } = appSlice.actions;

export default appSlice.reducer;
