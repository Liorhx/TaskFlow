import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TodoItem {
  _id: string;
  title: string;
  completed: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface TodoState {
  todos: TodoItem[];
  loading: boolean;
  error: string | null;
}

const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    todoActionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTodosSuccess: (state, action: PayloadAction<TodoItem[]>) => {
      state.loading = false;
      state.todos = action.payload;
    },
    todoActionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addTodoSuccess: (state, action: PayloadAction<TodoItem>) => {
      state.loading = false;
      // Prepend the new todo at the top of the list
      state.todos.unshift(action.payload);
    },
    updateTodoSuccess: (state, action: PayloadAction<TodoItem>) => {
      state.loading = false;
      const index = state.todos.findIndex((todo) => todo._id === action.payload._id);
      if (index !== -1) {
        state.todos[index] = action.payload;
      }
    },
    deleteTodoSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.todos = state.todos.filter((todo) => todo._id !== action.payload);
    },
    clearTodoError: (state) => {
      state.error = null;
    }
  },
});

export const {
  todoActionStart,
  fetchTodosSuccess,
  todoActionFailure,
  addTodoSuccess,
  updateTodoSuccess,
  deleteTodoSuccess,
  clearTodoError,
} = todoSlice.actions;

export default todoSlice.reducer;
