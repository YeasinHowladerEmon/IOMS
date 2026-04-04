# 📦 Inventory & Order Management System (IOMS)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)

**IOMS** is a premium, full-stack enterprise-grade inventory and order management platform. Built to optimize modern business workflows, it provides a highly interactive and high-performance interface for tracking stock, managing orders, and gaining deep analytical insights.

---

## ✨ Key Features & Platform Intelligence

*   **📊 Advanced Analytics Dashboard**: Real-time dual-metric visualization of key performance indicators (KPIs) with interactive `Recharts` graphs.
*   **🛒 Comprehensive Order Management**: Full order lifecycle management with modular design, server-side search, advanced date-range filtering, and pagination.
*   **🔄 Automated Inventory Health**: Dynamic restock queuing and intelligent conflict detection for robust inventory updates.
*   **🛠️ Robust Product & Category System**: Full CRUD capabilities for products, nested intuitive categorization, and low-stock threshold monitoring.
*   **📜 Comprehensive Audit Logging**: Detailed, system-wide activity logging for tracking state changes and maintaining strict accountability.
*   **🔐 Secure & Verified Authentication**: Robust user signup, login, and full logout flows protected by JWT authentication with backend session invalidation.
*   **💎 Premium, Modular UI/UX**: Built with a "wow-factor" modular design utilizing Radix UI primitives, Shadcn UI components, and smooth Framer Motion micro-animations.

---

## 🛠️ Technical Stack

**Frontend Framework & Core**
*   **Framework**: [Next.js 16+](https://nextjs.org/) (App Router, Server Components)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **State Management**: [TanStack React Query](https://tanstack.com/query/latest)
*   **Data Fetching**: [Axios](https://axios-http.com/)

**Styling & UI**
*   **Styling**: [Tailwind CSS 4.0+](https://tailwindcss.com/)
*   **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Charts**: [Recharts](https://recharts.org/)

**Form & Validation**
*   **Forms**: [React Hook Form](https://react-hook-form.com/)
*   **Validation Engine**: [Zod](https://zod.dev/)

**Backend Integration**
*   **API Ecosystem**: Node.js & Express (Configured for Vercel Serverless Deployment)
*   **Database Management**: PostgreSQL managed via Prisma ORM

---

## 🚀 Getting Started & Setup

### Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js**: `v18.x` or higher
*   **Package Manager**: `npm`, `yarn`, `pnpm`, or `bun`
*   **Git**: For version control

### 1. Clone the Repository

```bash
git clone https://github.com/YeasinHowladerEmon/IOMS.git
cd inventory-order-manegment
```

### 2. Install Dependencies

Install all necessary packages required for the Next.js frontend:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables Configuration

Create a `.env.local` file in the root directory of your project. This file is necessary to securely connect the Next.js frontend with the backend API.

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

*(Note: If you have deployed the backend to Vercel, replace `http://localhost:5000/api/v1` with your production Vercel API URL. If testing against a local backend, ensure your Node.js/Prisma backend server is running and accessible on port 5000.)*

### 4. Running the Development Server

Start the interactive Next.js development environment:

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your browser to view and interact with the application.

---

## 📁 Project Architecture

The codebase is organized in a highly modular pattern, ensuring long-term maintainability and performance scaling:

```text
inventory-order-manegment/
├── app/                  # Next.js 16 App Router (Pages, Layouts, Server Components)
│   ├── dashboard/        # Authenticated dashboard views (Orders, Products, Analytics)
│   └── (auth)/           # Authentication flows (Login, Register)
├── components/           # Reusable UI Architecture
│   ├── ui/               # Base presentational UI primitives (Shadcn components)
│   └── [feature]/        # Feature-specific modular components (e.g., /orders/components)
├── hooks/                # Custom reusable React Hooks managing state
├── lib/                  # Core Utilities, API client configurations, and Types
├── public/               # Static assets & graphical resources
└── tsconfig.json         # Strict TypeScript compiler configurations
```

---

## 🤝 Contribution Guidelines

1.  **Fork** the repository.
2.  **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`). Please ensure you resolve all strict TypeScript typing checks before committing.
4.  **Push** to the Branch (`git push origin feature/AmazingFeature`).
5.  **Open** a Pull Request.

---

## 🛡️ License

This project is licensed under the **MIT License**.

---

*Architected with ❤️ for scalable, seamless business intelligence.*