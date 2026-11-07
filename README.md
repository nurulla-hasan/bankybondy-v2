# Next.js 16 Production Starter 🚀

A production-grade, enterprise-ready starter template built with **Next.js 16 (Turbopack)**, **React 19**, **Tailwind CSS v4**, and the latest web engineering standards.

---

## ⚡ Tech Stack & Highlights

- **Framework**: Next.js 16.4.4 (App Router, Turbopack)
- **Runtime & UI**: React 19.3.0 & Base UI
- **Design System**: Tailwind CSS v4 + Shadcn UI (Full suite)
- **Data Fetching & Server State**: TanStack React Query v5
- **Forms & Validation**: TanStack Form + Zod v4
- **Tables & Visualization**: TanStack Table v8 + Recharts v3
- **Network & API**: `ofetch` Client + Reverse Proxy Rewrites + JWT Support
- **Theming & Toast**: `next-themes` (Dark/Light) + Sonner Toasts
- **Quality Gates**: Strict design rules, error boundaries, 404 handler, and loading states
- **AI Agent-Ready**: Integrated with Addy Osmani's 25 Engineering Skills & Context7 MCP support

---

## 📁 Project Structure

```text
├── .github/
│   └── copilot-instructions.md   # Strict design & architecture rules
├── public/                       # Static assets & icons
├── src/
│   ├── app/                      # App router (layout, loading, error, not-found)
│   ├── components/
│   │   ├── common/               # Modal, ImageCropper, Data Table, etc.
│   │   └── ui/                   # Full Shadcn / Base UI components
│   ├── constants/                # App-wide routes & constants
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # api-client, jwt, toast, utils, error
│   ├── provider/                 # Theme, QueryClient, and Toast providers
│   ├── services/                 # api calls & query hooks
│   ├── types/                    # TypeScript interfaces & types
│   └── validations/              # Zod validation schemas
├── .env.example                  # Environment configuration template
├── components.json               # Shadcn UI configuration
└── next.config.ts                # Next.js config with backend API proxy rewrites
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Build & Lint

```bash
# Type-check and production build
pnpm build

# Linting
pnpm lint
```

---

## Subscription checkout

The private `/subscriptions` page uses the backend's `/normal-user/subscription-prices`, `/normal-user/subscription-checkout`, and `/normal-user/subscribe` endpoints. Paid plans are one-time purchases.

PayPal checkout is disabled by default. On the backend, configure `SUBSCRIPTION_RETURN_URL` to the V2 subscriptions page (HTTPS in production), and set `SUBSCRIPTION_LEGACY_CHECKOUTS_RECONCILED=true` **only after** reconciling and invalidating previously issued checkout links. Verify the PayPal webhook configuration and test the complete flow in a sandbox before enabling it. The server retains uncertain attempts and blocks another checkout until a verified outcome; unresolved attempts require operator investigation.

Mercado Pago is currently unavailable in V2: its Checkout Pro preference reuse and reconciliation must be resolved and sandbox-tested before enabling it. Browser redirects are never treated as proof of payment.

---

## 📄 License

MIT

