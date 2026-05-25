# Taskify — Production-Ready Full-Stack Todo Application

Taskify is an enterprise-grade full-stack Todo application built on modern industry standards. It features strong sessions managed by JWT tokens inside secure, cross-site scripting (XSS) resistant **HttpOnly cookies**, persistent document modeling via **MongoDB & Mongoose**, predictable client-side state architecture using **Redux Toolkit**, and declarative, pixel-perfect layouts designed with **Tailwind CSS**.

---

## 🚀 Key Features

* **HttpOnly Session Cookies**: Eliminates local storage leakage risks. Tokens are written, verified, and cleared strictly on the server-side.
* **Dual-Mode Persistence (Sandboxed Fallback)**: Automatically attempts connection to MongoDB. If `MONGODB_URI` is not initialized, it triggers an intelligent, high-fidelity in-memory session mock DB fallback so that preview and development states are fully operational.
* **Staggered Orchestrations via Redux Toolkit**: Features a reliable, decoupled client-side data state layer managing lists, checkboxes, and interactive editing modes.
* **Declarative Zod Schema Validations**: Reusable validations checking data compliance inside React inputs and Express endpoints simultaneously.
* **Fluid UI Transitions**: Styled with **Inter** and **JetBrains Mono** font layers paired with micro-animations driven by **Motion** state exits.

---

## 🛠 Tech Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 19 • Redux Toolkit | State management, active filters, typed dispatch hooks. |
| **Vite Engine** | Vite & TypeScript | Accelerated bundling, absolute type checks. |
| **Styling** | Tailwind CSS v4 | High-contrast visual cards, responsive flex grids. |
| **Backend API** | Express | Cookie parsers, protected routes, unified controllers. |
| **Database** | MongoDB • Mongoose | Relational ObjectId mappings, indexing, timestamps. |
| **Validation** | Zod | Deep schemas enforcing field lengths and values. |
| **Security** | JWT • bcryptjs | High-entropy token generation and salted password hashing. |

---

## 📁 Project Structure

Following standard full-stack, modular guidelines:

```
src/
 ├── components/
 │   ├── auth/
 │   │   ├── LoginView.tsx       # Zod-validated secure login page
 │   │   └── RegisterView.tsx    # Zod-validated account creation
 │   ├── todos/
 │   │   ├── DashboardView.tsx   # Core dashboard, secure listings & filters
 │   │   ├── TodoForm.tsx        # Title creation form (Zod Title Schema)
 │   │   ├── TodoItem.tsx        # Motion-animated checkbox, inline editor
 │   │   └── TodoEmpty.tsx       # Illustrated visual placeholder
 │   └── ui/
 │       └── Loader.tsx          # Dynamic spinner for loading sessions
 │
 ├── lib/
 │   ├── mongodb.ts              # Mongoose client initialization
 │   ├── dbInMemory.ts           # Sandboxed backup mock DB
 │   ├── jwt.ts                  # Sign/verify JSON Web Tokens
 │   ├── auth.ts                 # Local storage session markers
 │   └── axios.ts                # Configured credentials proxy client
 │
 ├── models/
 │   ├── User.ts                 # Mongoose User Document Schema
 │   └── Todo.ts                 # Mongoose Todo Document Schema (Ref User)
 │
 ├── redux/
 │   ├── store.ts                # Configured Redux Toolkit master store
 │   ├── hooks.ts                # Typed Redux hooks (useAppDispatch, Selector)
 │   └── features/
 │       ├── authSlice.ts        # Session, status, & database indicators
 │       └── todoSlice.ts        # Todo arrays & CRUD state updates
 │
 ├── validations/
 │   ├── auth.validation.ts      # Account registration/login Zod schemas
 │   └── todo.validation.ts      # Task title/completion status Zod schemas
 │
 ├── middleware/
 │   └── authMiddleware.ts       # Express router session validator (HttpOnly)
 │
 └── App.tsx                     # Core wrapper coordinating state Provider
```

---

## 🌐 API Documentation

All request payloads and responses use strict JSON format.

### 🔐 Authentication Router
* **`POST /api/auth/register`**
  * Registers a new user and automatically logs them in (issues JWT cookie).
  * *Request Body*:
    ```json
    {
      "name": "Alex Mercer",
      "email": "alex@example.com",
      "password": "strongpassword123"
    }
    ```
  * *Response (201 Created)*:
    ```json
    {
      "success": true,
      "message": "Registration successful!",
      "user": { "userId": "64bc0b3...", "email": "alex@example.com", "name": "Alex Mercer" },
      "databaseMode": "MongoDB"
    }
    ```

* **`POST /api/auth/login`**
  * Verifies user credentials, sets session token in HttpOnly cookie.
  * *Request Body*:
    ```json
    {
      "email": "alex@example.com",
      "password": "strongpassword123"
    }
    ```
  * *Response (200 OK)*:
    ```json
    {
      "success": true,
      "message": "Login successful!",
      "user": { "userId": "64bc0b3...", "email": "alex@example.com", "name": "Alex Mercer" },
      "databaseMode": "MongoDB"
    }
    ```

* **`GET /api/auth/me`**
  * Retrieves details of the currently authenticated session (Uses `authMiddleware`).
  * *Response (200 OK)*:
    ```json
    {
      "success": true,
      "user": { "userId": "64bc0b3...", "email": "alex@example.com", "name": "Alex Mercer" },
      "databaseMode": "MongoDB"
    }
    ```

* **`POST /api/auth/logout`**
  * Removes and clears the active JWT HttpOnly cookie token.
  * *Response (200 OK)*:
    ```json
    {
      "success": true,
      "message": "Logged out successfully."
    }
    ```

---

### 📋 Todo Task Router (All endpoints are fully protected)
* **`GET /api/todos`**
  * Fetches all todo cards belonging to the logged-in user, sorted chronologically by default.
  * *Response (200 OK)*:
    ```json
    {
      "success": true,
      "todos": [
        {
          "_id": "64bdc1...",
          "title": "Configure production MongoDB migrations",
          "completed": false,
          "user": "64bc0b3...",
          "createdAt": "2026-05-25T08:14:00.000Z",
          "updatedAt": "2026-05-25T08:14:00.000Z"
        }
      ]
    }
    ```

* **`POST /api/todos`**
  * Creates a new task card.
  * *Request Body*:
    ```json
    {
      "title": "Complete full-stack integration verification"
    }
    ```
  * *Response (210 Created)*:
    ```json
    {
      "success": true,
      "todo": {
        "_id": "64bdc3...",
        "title": "Complete full-stack integration verification",
        "completed": false,
        "user": "64bc0b3...",
        "createdAt": "2026-05-25T08:15:00.000Z"
      }
    }
    ```

* **`PUT /api/todos/:id`**
  * Updates an existing task item title or completes it.
  * *Request Body* (any or both fields):
    ```json
    {
      "title": "Updated verification title",
      "completed": true
    }
    ```
  * *Response (200 OK)*:
    ```json
    {
      "success": true,
      "todo": { ... }
    }
    ```

* **`DELETE /api/todos/:id`**
  * Deletes a todo card permanently from database.
  * *Response (200 OK)*:
    ```json
    {
      "success": true,
      "message": "Todo deleted successfully."
    }
    ```

---

## ⚙️ Environment Variables

Copy `.env.example` into `.env` to configure locally:

```env
# MongoDB Connection String
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.net/taskify"

# High-entropy JWT Signing secret
JWT_SECRET="YOUR_RANDOM_HIGH_ENTROPY_SYSTEM_KEY"
```

---

## 🛠 Development & Build Commands

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run in Development
Start full-stack live-reloading Express and Vite layers concurrently:
```bash
npm run dev
```

### 3. Production Build Compilation
Builds client static assets inside `/dist` and bundles backend Express script to `/dist/server.cjs` using optimized **esbuild**:
```bash
npm run build
```

### 4. Run Production Server
Launches the standalone bundled server script:
```bash
npm run start
```
