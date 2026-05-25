import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice.ts";
import todosReducer from "./features/todoSlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
