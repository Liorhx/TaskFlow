import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .regex(/^[A-Za-z\s]+$/, { message: "Name must only contain alphabetic letters and spaces." })
    .trim(),
  email: z
    .string()
    .email({ message: "Please provide a valid email address." })
    .trim()
    .lowercase(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one numeric digit." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character (e.g., @$!%*?&)." }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Please provide a valid email address." })
    .trim()
    .lowercase(),
  password: z
    .string()
    .min(1, { message: "Password is required." }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
