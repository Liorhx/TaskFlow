import { z } from "zod";

export const todoCreateSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Task title must be at least 3 characters long." })
    .max(120, { message: "Task title cannot exceed 120 characters." })
    .trim(),
});

export const todoUpdateSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Task title must be at least 3 characters long." })
    .max(120, { message: "Task title cannot exceed 120 characters." })
    .trim()
    .optional(),
  completed: z
    .boolean()
    .optional(),
});

export type TodoCreateInput = z.infer<typeof todoCreateSchema>;
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>;
