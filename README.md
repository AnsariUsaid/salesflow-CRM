# SalesFlow CRM

A comprehensive CRM system for automobile parts sales with call-based order management.

## 🏗️ Architecture

This is a monorepo containing both the backend and frontend applications:

```
salesflow-CRM/
├── backend/          # GraphQL API with Prisma & PostgreSQL
├── frontend/         # Next.js 16 + React 19 UI
└── README.md
```

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express**
- **Apollo GraphQL Server**
- **Prisma ORM**
- **PostgreSQL** Database
- **TypeScript**

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **Apollo Client** (GraphQL)
- **Tailwind CSS**
- **TypeScript**
- **Lucide Icons**

## 📋 Prerequisites

- Node.js >= 18
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

### Quick Start
\`\`\`bash
# Install root dependencies
npm install

# Install all dependencies (root + frontend + backend)
npm run install:all
\`\`\`

## ⚙️ Configuration

### Backend (.env)
Create \`backend/.env\`:
\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/salesflow_crm?schema=public"
PORT=8000
\`\`\`

### Frontend (.env.local)
Create \`frontend/.env.local\`:
\`\`\`env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql
\`\`\`

## 🗄️ Database Setup

\`\`\`bash
# Create database
createdb salesflow_crm

# Run migrations
cd backend
npx prisma migrate dev
\`\`\`

## 🎯 Running the Application

### Development Mode

\`\`\`bash
# Run both frontend and backend concurrently
npm run dev
\`\`\`

**Or run separately:**
\`\`\`bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
\`\`\`

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend GraphQL**: http://localhost:8000/graphql

## 🔑 Key Features

- ✅ **GraphQL API** with comprehensive schema
- ✅ **Modern UI** with dashboard, stats, and activity feed
- ✅ **Order Management** with product search and cart
- ✅ **Payment Processing** interface
- ✅ **User Roles** (Admin, Sales Agent, Processing Agent, Followup Agent)
- ✅ **Real-time Updates** with Apollo Client
- ✅ **Type Safety** with TypeScript throughout

## 👤 Author

**Ansari Usaid**
- GitHub: [@AnsariUsaid](https://github.com/AnsariUsaid)
