import mongoose, { Schema, Document } from "mongoose";

export interface ITodo extends Document {
  title: string;
  completed: boolean;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

export const Todo = mongoose.models.Todo || mongoose.model<ITodo>("Todo", TodoSchema);
