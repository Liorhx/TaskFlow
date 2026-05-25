import bcrypt from "bcryptjs";

export interface DBUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface DBTodo {
  _id: string;
  title: string;
  completed: boolean;
  user: string; // userId reference
  createdAt: Date;
  updatedAt: Date;
}

class InMemoryDatabase {
  public users: DBUser[] = [];
  public todos: DBTodo[] = [];

  constructor() {
    // Seed data
    const seedHash = bcrypt.hashSync("password123", 10);
    this.users.push({
      _id: "demo-user-id",
      name: "Demo User",
      email: "demo@example.com",
      passwordHash: seedHash,
      createdAt: new Date(),
    });

    this.todos.push(
      {
        _id: "todo-1",
        title: "Welcome to your Full-Stack Todo app! (Mock Session Mode)",
        completed: false,
        user: "demo-user-id",
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
      },
      {
        _id: "todo-2",
        title: "Try creating, toggling, and deleting tasks securely",
        completed: true,
        user: "demo-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  }

  async findUserByEmail(email: string): Promise<DBUser | undefined> {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: string): Promise<DBUser | undefined> {
    return this.users.find(u => u._id === id);
  }

  async createUser(name: string, email: string, passwordHash: string): Promise<DBUser> {
    const newUser: DBUser = {
      _id: `user_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      passwordHash,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async getTodos(userId: string): Promise<DBTodo[]> {
    return this.todos.filter(t => t.user === userId).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTodo(userId: string, title: string): Promise<DBTodo> {
    const newTodo: DBTodo = {
      _id: `todo_${Math.random().toString(36).substr(2, 9)}`,
      title,
      completed: false,
      user: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  async updateTodo(userId: string, todoId: string, updates: Partial<Pick<DBTodo, "title" | "completed">>): Promise<DBTodo | null> {
    const todo = this.todos.find(t => t._id === todoId && t.user === userId);
    if (!todo) return null;

    if (updates.title !== undefined) todo.title = updates.title;
    if (updates.completed !== undefined) todo.completed = updates.completed;
    todo.updatedAt = new Date();
    return todo;
  }

  async deleteTodo(userId: string, todoId: string): Promise<boolean> {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(t => !(t._id === todoId && t.user === userId));
    return this.todos.length < initialLength;
  }
}

export const dbInMemory = new InMemoryDatabase();
