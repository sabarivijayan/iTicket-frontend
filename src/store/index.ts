// src/store.ts
import { configureStore, createSlice } from "@reduxjs/toolkit";

// User Slice
const userSlice = createSlice({
  name: "user",
  initialState: { isLoggedIn: false },
  reducers: {
    login(state) {
      state.isLoggedIn = true;
      // Optionally, you can store more user info here
    },
    logout(state) {
      localStorage.removeItem("userId"); // Remove user ID from localStorage
      state.isLoggedIn = false;
    },
  },
});

// Admin Slice
const adminSlice = createSlice({
  name: "auth",
  initialState: { isLoggedIn: false },
  reducers: {
    login(state) {
      state.isLoggedIn = true;
    },
    logout(state) {
      state.isLoggedIn = false;
      localStorage.removeItem("adminId"); // Remove admin ID from localStorage
      localStorage.removeItem("token");   // Remove token from localStorage
    },
  },
});

export const userActions = userSlice.actions;
export const adminActions = adminSlice.actions;

// Configure Store
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    auth: adminSlice.reducer,
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
