# SalesFlow CRM

A custom CRM system for automobile parts sales with call-based order management.

## 📌 Overview

SalesFlow CRM is designed for automobile parts businesses where customers call the sales team to place orders. The system manages the entire workflow from initial customer contact through payment processing, order fulfillment, and follow-up.

## 🚀 Features

- **Customer Management** - Track customer details and order history
- **Order Management** - Create and manage orders for automobile parts
- **Product Catalog** - Manage inventory of automobile parts by make, model, and year
- **Secure Payment Processing** - Integrate with Authorize.net without exposing credentials to sales team
- **Team Assignment** - Assign orders to sales, processing, and follow-up teams
- **Order Tracking** - Track order status from quote to delivery
- **Support Tickets** - Handle customer issues and feedback

## 👥 User Roles

- **Admin** - Manage users, roles, organizations, and permissions
- **Sales Team** - Receive calls, create orders, process payments
- **Processing Team** - Procure parts, manage shipping
- **Follow-Up Team** - Track delivery, collect feedback, handle tickets
- **Customer** - End users who place orders

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Backend**: GraphQL API (to be implemented)
- **Database**: PostgreSQL/MySQL (to be configured)
- **Payments**: Authorize.net API

## 🏁 Getting Started

### Prerequisites

- Node.js 20+ 
- npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AnsariUsaid/salesflow-CRM.git
cd salesflow-CRM
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
/app              # Next.js app directory
/public           # Static assets
/src              # Source code (components, lib, types)
```

## 🔐 Environment Variables

Required environment variables will be documented as features are implemented:
- Clerk authentication keys
- Database connection
- Authorize.net API credentials

## 📝 License

Private - All rights reserved
