import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserSession {
  userId: string;
  email: string;
  name: string;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  databaseMode: "MongoDB" | "Mock-Memory";
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  databaseMode: "MongoDB",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (
      state,
      action: PayloadAction<{ user: UserSession; databaseMode: "MongoDB" | "Mock-Memory" }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.databaseMode = action.payload.databaseMode;
      state.error = null;
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setDatabaseMode: (state, action: PayloadAction<"MongoDB" | "Mock-Memory">) => {
      state.databaseMode = action.payload;
    }
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  logoutSuccess,
  clearAuthError,
  setDatabaseMode,
} = authSlice.actions;

export default authSlice.reducer;
