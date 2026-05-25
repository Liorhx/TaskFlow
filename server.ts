import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./src/lib/mongodb.ts";
import { dbInMemory } from "./src/lib/dbInMemory.ts";
import { User } from "./src/models/User.ts";
import { Todo } from "./src/models/Todo.ts";
import { registerSchema, loginSchema } from "./src/validations/auth.validation.ts";
import { todoCreateSchema, todoUpdateSchema } from "./src/validations/todo.validation.ts";
import { signToken } from "./src/lib/jwt.ts";
import { authMiddleware, AuthRequest } from "./src/middleware/authMiddleware.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Let's connect to database (or check connection status)
  const isMongoConnected = await connectDB();

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // Log incoming requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // ----------------------------------------------------
  // AUTHENTICATION APIS
  // ----------------------------------------------------

  // POST /api/auth/register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const dbConnected = await connectDB();
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues.map(err => err.message),
        });
        return;
      }

      const { name, email, password } = validationResult.data;

      let userId = "";
      let databaseMode: "MongoDB" | "Mock-Memory" = "MongoDB";

      if (dbConnected) {
        // Real MongoDB Account Creation
        const existingUser = await (User as any).findOne({ email });
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: "An account with this email already exists.",
          });
          return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          name,
          email,
          passwordHash,
        });

        userId = newUser._id.toString();
        databaseMode = "MongoDB";
      } else {
        // Fallback Local Memory Creation
        const existingUser = await dbInMemory.findUserByEmail(email);
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: "An account with this email already exists.",
          });
          return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await dbInMemory.createUser(name, email, passwordHash);
        userId = newUser._id;
        databaseMode = "Mock-Memory";
      }

      // Automatically sign in the user by signing JWT
      const token = signToken({ userId, email, name });

      // Set JWT HttpOnly cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: "Registration successful!",
        token,
        user: { userId, email, name },
        databaseMode,
      });
    } catch (error: any) {
      console.error("Register Error:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred during registration.",
      });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const dbConnected = await connectDB();
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues.map(err => err.message),
        });
        return;
      }

      const { email, password } = validationResult.data;

      let userId = "";
      let userName = "";
      const databaseMode: "MongoDB" | "Mock-Memory" = dbConnected ? "MongoDB" : "Mock-Memory";

      if (dbConnected) {
        const user = await (User as any).findOne({ email });
        if (!user) {
          res.status(401).json({
            success: false,
            message: "Invalid email or password.",
          });
          return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          res.status(401).json({
            success: false,
            message: "Invalid email or password.",
          });
          return;
        }

        userId = user._id.toString();
        userName = user.name;
      } else {
        const user = await dbInMemory.findUserByEmail(email);
        if (!user) {
          res.status(401).json({
            success: false,
            message: "Invalid email or password.",
          });
          return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          res.status(401).json({
            success: false,
            message: "Invalid email or password.",
          });
          return;
        }

        userId = user._id;
        userName = user.name;
      }

      // Create Session JWT
      const token = signToken({ userId, email, name: userName });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: "Login successful!",
        token,
        user: { userId, email, name: userName },
        databaseMode,
      });
    } catch (error: any) {
      console.error("Login Error:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred during login.",
      });
    }
  });

  // GET /api/auth/me
  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const dbConnected = await connectDB();
      const currDatabaseMode: "MongoDB" | "Mock-Memory" = (dbConnected && !req.isMockUser) ? "MongoDB" : "Mock-Memory";

      res.status(200).json({
        success: true,
        user: req.user,
        databaseMode: currDatabaseMode,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Could not retrieve user context.",
      });
    }
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });

  // ----------------------------------------------------
  // TODO LIST MANAGEMENT APIS (Protected)
  // ----------------------------------------------------

  // GET /api/todos
  app.get("/api/todos", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      if (req.isMockUser) {
        const todos = await dbInMemory.getTodos(userId);
        res.status(200).json({
          success: true,
          todos,
        });
        return;
      }

      // Database Fetch
      const todos = await (Todo as any).find({ user: userId }).sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        todos,
      });
    } catch (error) {
      console.error("GET Todos Error:", error);
      res.status(500).json({
        success: false,
        message: "Could not fetch todos from server database.",
      });
    }
  });

  // POST /api/todos
  app.post("/api/todos", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const validationResult = todoCreateSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues.map(err => err.message),
        });
        return;
      }

      const { title } = validationResult.data;

      if (req.isMockUser) {
        const newTodo = await dbInMemory.createTodo(userId, title);
        res.status(201).json({
          success: true,
          todo: newTodo,
        });
        return;
      }

      // MongoDB Insertion
      const newTodo = await (Todo as any).create({
        title,
        completed: false,
        user: userId,
      });

      res.status(201).json({
        success: true,
        todo: newTodo,
      });
    } catch (error) {
      console.error("POST Todo Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create todo item.",
      });
    }
  });

  // PUT /api/todos/:id
  app.put("/api/todos/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const todoId = req.params.id;

      const validationResult = todoUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues.map(err => err.message),
        });
        return;
      }

      const updates = validationResult.data;

      if (req.isMockUser) {
        const updatedTodo = await dbInMemory.updateTodo(userId, todoId, updates);
        if (!updatedTodo) {
          res.status(404).json({
            success: false,
            message: "Todo item not found.",
          });
          return;
        }
        res.status(200).json({
          success: true,
          todo: updatedTodo,
        });
        return;
      }

      // MongoDB Update
      const updatedTodo = await (Todo as any).findOneAndUpdate(
        { _id: todoId, user: userId },
        updates,
        { new: true }
      );

      if (!updatedTodo) {
        res.status(404).json({
          success: false,
          message: "Todo item not found or unauthorized.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        todo: updatedTodo,
      });
    } catch (error) {
      console.error("PUT Todo Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update todo item.",
      });
    }
  });

  // DELETE /api/todos/:id
  app.delete("/api/todos/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const todoId = req.params.id;

      if (req.isMockUser) {
        const deleted = await dbInMemory.deleteTodo(userId, todoId);
        if (!deleted) {
          res.status(404).json({
            success: false,
            message: "Todo item not found.",
          });
          return;
        }
        res.status(200).json({
          success: true,
          message: "Todo deleted successfully.",
        });
        return;
      }

      // MongoDB Deletion
      const result = await (Todo as any).deleteOne({ _id: todoId, user: userId });
      if (result.deletedCount === 0) {
        res.status(404).json({
          success: false,
          message: "Todo item not found or unauthorized.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Todo deleted successfully.",
      });
    } catch (error) {
      console.error("DELETE Todo Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete todo item.",
      });
    }
  });

  // ----------------------------------------------------
  // VITE DEV / PRODUCTION STATIC BUILD AGENT
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Integrative Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from: " + distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application server listening at: http://0.0.0.0:${PORT}`);
  });
}

startServer();
