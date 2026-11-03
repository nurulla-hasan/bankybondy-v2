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
1. NEVER use hardcoded color values (e.g., `text-amber-500`, `bg-[#123456]`, `border-blue-300`, custom hex/rgb/oklch) directly on any component.
2. ALWAYS use CSS variable-based colors: `text-primary`, `bg-muted`, `border-border`, etc. All colors must be defined in `globals.css`.
3. Every color variable MUST have BOTH `:root` (light mode) and `.dark` (dark mode) definitions in `globals.css`, plus an `@theme inline` entry for Tailwind v4.
4. If a color you need doesn't exist in `globals.css`, add it first — in all three places: `@theme inline` block, `:root` section, and `.dark` section. Never skip dark mode.
5. For opacity variants, use the slash syntax with CSS variables: `text-primary/80`, `bg-primary/10`, `border-border/50`. Do NOT hardcode separate opacity colors.

## 📱 Responsive Design Rule
1. ALWAYS follow a mobile-first approach. Use base Tailwind utility classes for mobile screens and apply breakpoints (`sm:`, `md:`, `lg:`) for larger screens.

## 🛡️ TypeScript & Error Handling Rules
1. ALWAYS use `error: unknown` in `catch` blocks instead of `error: any` to satisfy strict linting rules.
2. When extracting error messages, safely check the error type using `error instanceof Error ? error.message : "Fallback message"` or `getErrorMessage(error)`.

## 💡 Naming & Code Conventions
1. Utility functions, helpers, and handlers MUST use `camelCase` (e.g., `addToast`, `formatDate`, `getInitials`). NEVER use `PascalCase` for regular functions.
2. Components, Types, and Interfaces use `PascalCase`.
3. API Client calls should live in `src/services/api/` and React Query hooks in `src/services/hooks/`.
4. Forms use `@tanstack/react-form` or React Hook Form with Zod schemas in `src/validations/`.
