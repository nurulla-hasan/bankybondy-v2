# BankyBondy V2 — Engineering Rules & Constraints

This project follows the strict engineering standards established in `L2B7A7-main` and Addy Osmani's agent skills.

## 📚 Documentation & Knowledge Rules
1. DO NOT rely on outdated pre-trained knowledge.
2. ALWAYS verify latest syntax using official docs and the Context7 MCP server (`use context7`).

## 🎨 Shadcn UI Rules
1. Shadcn components are pre-designed. Prefer built-in props like `variant` and `size` over ad-hoc styling.
2. NEVER use `className` on a shadcn component to mutate its internal appearance such as height, padding, colors, or typography.
3. **Layout & Width Exception (`w-full` is allowed):**
   - Classes controlling container-level width (e.g. `w-full`, `w-auto`) are completely permitted directly on components (e.g., `<Button className="w-full">`).
   - For margins and outer spacing, prefer wrapping the component in parent layout containers (grid/flex gaps) rather than applying outer margins directly.
4. If you need a new appearance (height, padding, typography, custom variants), EXTEND the component's `variant` or `size` in its source file with `cva()`. Add only what you actually need.
5. The same rule applies to any custom component that already uses `cva()` — extend variants, do not override with `className`.

## 🎨 Color System Rules
1. NEVER use hardcoded color values (e.g., `text-amber-500`, `bg-[#123456]`, `border-blue-300`, custom hex/rgb/oklch, `#fff`, `#000`, `text-white`, `bg-black`, `border-white`, `text-black`) directly on any component.
2. ALWAYS use CSS variable-based colors: `text-primary`, `bg-muted`, `border-border`, etc. All colors must be defined in `globals.css`.
3. Every color variable MUST have BOTH `:root` (light mode) and `.dark` (dark mode) definitions in `globals.css`, plus an `@theme inline` entry for Tailwind v4.
4. If a color you need doesn't exist in `globals.css`, add it first — in all three places: `@theme inline` block, `:root` section, and `.dark` section. Never skip dark mode.
5. For opacity variants, use the slash syntax with CSS variables: `text-primary/80`, `bg-primary/10`, `border-border/50`. Do NOT hardcode separate opacity colors.

## 📏 Sizing & Tailwind Scale Rules
1. NEVER write arbitrary bracket values for dimensions, paddings, margins, or sizing such as `w-[500px]`, `h-[300px]`, `p-[20px]`, `max-w-[380px]`, etc.
2. ALWAYS use Tailwind's modern linear numeric scale:
   - For example: instead of `w-[500px]`, write `w-125` ($125 \times 4\text{px} = 500\text{px}$).
   - Instead of `h-[400px]`, write `h-100`.
   - Use standard Tailwind utility classes (`w-full`, `max-w-md`, `max-w-xl`, `h-96`, `p-6`, `gap-4`, `rounded-2xl`, etc.).

## 🚫 Common AI Anti-Patterns (Strictly Forbidden)
1. **NO Redundant React Hook Form**: We strictly use `@tanstack/react-form` + `Zod v4`. Do not import or suggest `react-hook-form` or `@hookform/resolvers`.
2. **NO Outdated Zod 3 Syntax**: Always use modern Zod v4 syntax: `z.email({ error: "..." })` instead of `z.string().email({ message: "..." })`.
3. **NO Direct State Mutation**: Always use immutable updates and TanStack Query cache invalidations.
4. **NO Silent Error Swallowing**: Always log or handle errors using `getErrorMessage(error)` and `errorToast()`.
5. **NO className overrides on Shadcn Components**: When consuming components like `<Button>`, `<Card>`, `<Input>`, etc., never pass visual overrides like custom background, border, padding or typography. Only layout classes like `w-full`, `flex`, `grid` are allowed.


## 📱 Responsive Design Rule
1. ALWAYS follow a mobile-first approach. Use base Tailwind utility classes for mobile screens and apply breakpoints (`sm:`, `md:`, `lg:`) for larger screens.

## 🛡️ TypeScript & Error Handling Rules
1. ALWAYS use `error: unknown` in `catch` blocks instead of `error: any` to satisfy strict linting rules.
2. When extracting error messages, safely check the error type using `error instanceof Error ? error.message : "Fallback message"` or `getErrorMessage(error)`.

## 💡 Naming & Code Conventions
1. Utility functions, helpers, and handlers MUST use `camelCase` (e.g., `addToast`, `formatDate`, `getInitials`). NEVER use `PascalCase` for regular functions.
2. Components, Types, and Interfaces use `PascalCase`.
3. API Client calls should live in `src/services/api/` and React Query hooks in `src/services/hooks/`.
4. Forms use `@tanstack/react-form` with Zod v4 schemas in `src/validations/`.

---

# 🧠 Agent Skills Execution Matrix (Addy Osmani)

Each phase of development in this project MUST invoke and follow the corresponding skill workflow:

| Development Phase / Scenario | Skill to Invoke | Mandatory Workflow / Action |
|---|---|---|
| **Requirement Gathering & Clarity** | `interview-me` / `spec-driven-development` | Never guess requirements; ask focused questions and define data contracts before coding. |
| **Breaking Down Tasks** | `planning-and-task-breakdown` | Decompose features into atomic, testable, dependency-ordered tasks (Types ➔ Validations ➔ API ➔ Hooks ➔ UI). |
| **Grounding in Official Docs** | `source-driven-development` | Ground every library (Next.js 16, React 19, Zod 4, TanStack) using the Context7 MCP server. Never rely on outdated patterns. |
| **UI & Component Architecture** | `frontend-ui-engineering` | Mobile-first, strict semantic CSS variables, zero hardcoded colors, strict Shadcn CVA variants, WCAG AA accessible. |
| **API, Schema & Network Layer** | `api-and-interface-design` | Clean DTOs in `types/`, Zod 4 schemas in `validations/`, typed `ofetch` in `services/api/`, React Query in `services/hooks/`. |
| **Executing Code Changes** | `incremental-implementation` | Thin vertical slices — write types and tests, build incrementally, verify build after each change. |
| **Handling Bugs & Build Failures** | `debugging-and-error-recovery` | Stop-the-line rule. Reproduce, localize, fix root-cause (never suppress errors or patch symptoms). |
| **Pre-Merge & Quality Gate** | `code-review-and-quality` | 5-axis review checking for hardcoded styles, unused code, memory leaks, and adherence to L2B7A7 rules. |
| **Authentication & Sensitive Logic**| `security-and-hardening` | Sanitization, secure cookie storage, CSRF headers, anti-enumeration messages, and OWASP Top 10 compliance. |
| **Refactoring & Cleanups** | `code-simplification` | Reduce nesting, remove dead code, maintain Chesterton's Fence principle. |

