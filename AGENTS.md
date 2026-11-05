<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

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
6. **Component source files are exempt from consumption-side rules.** A page or feature component consuming `<Badge>` / `<Button>` / `<Input>` must not override appearance via `className`, but the source files inside `components/ui/**` (shadcn-managed or hand-authored by us) are where variants and their color recipes legitimately live. Never "fix" a palette color found inside those files — extend a variant there, or consume an existing one.

✅ Allowed — layout width stretching to the parent form/container:

```tsx
<Button className="w-full" size="lg">
  Sign In
</Button>
```

✅ Correct — extend appearance via `cva()`:

```tsx
// button.tsx — add a new size
size: {
  xl: "h-12 gap-2 px-5 text-base";
}

// usage
<Button size="xl">Book now</Button>;
```

❌ Wrong — ad-hoc appearance overrides via `className`:

```tsx
<Button className="h-12 px-5 text-base bg-blue-600">Book now</Button>
```

## 🎨 Color System Rules

1. NEVER use hardcoded color values (e.g., `text-amber-500`, `bg-[#123456]`, `border-blue-300`, custom hex/rgb/oklch, `#fff`, `#000`, `text-white`, `bg-black`, `border-white`, `text-black`) directly on any component.
2. ALWAYS use CSS variable-based colors: `text-primary`, `bg-muted`, `border-border`, etc. All colors must be defined in `globals.css`.
3. Every color variable MUST have BOTH `:root` (light mode) and `.dark` (dark mode) definitions in `globals.css`, plus an `@theme inline` entry for Tailwind v4.
4. If a color you need doesn't exist in `globals.css`, add it first — in all three places: `@theme inline` block, `:root` section, and `.dark` section. Never skip dark mode.
5. For opacity variants, use the slash syntax with CSS variables: `text-primary/80`, `bg-primary/10`, `border-border/50`. Do NOT hardcode separate opacity colors.
6. **Exemption — palette colors inside component source files are deliberate.** `components/ui/**` (e.g. `badge.tsx` custom variants, `drawer.tsx`, `sheet.tsx` — shadcn-generated or hand-authored by us) and our own `components/common/**` (e.g. `custom-calender.tsx`, `image-crop-dialog.tsx` crop backdrop) are intentional and must NOT be refactored to tokens or flagged. This does not soften rule 1: app-level pages and feature components still use CSS-variable colors, adding the token to `globals.css` first when it is missing (see rule 4).

## 📏 Sizing & Tailwind Scale Rules

1. NEVER write arbitrary bracket values for dimensions, paddings, margins, or sizing such as `w-[500px]`, `h-[300px]`, `p-[20px]`, `max-w-[380px]`, etc. This applies to app-level pages and feature components; the `components/ui/**` / `components/common/**` source files listed in the Color System Rules exemption (rule 6) keep their own internal sizing (e.g. `p-[3px]`) under the same exemption.
2. ALWAYS use Tailwind's modern linear numeric scale:
   - For example: instead of `w-[500px]`, write `w-125` ($125 \times 4\text{px} = 500\text{px}$).
   - Instead of `h-[400px]`, write `h-100`.
   - Use standard Tailwind utility classes (`w-full`, `max-w-md`, `max-w-xl`, `h-96`, `p-6`, `gap-4`, `rounded-2xl`, etc.).
3. **Global Container Width Standard:**
   - Every page and layout container MUST use `CONTAINER_MAX_WIDTH` (`max-w-350` / $350 \times 4\text{px} = 1400\text{px}$), defined in `@/lib/layout` and applied by `@/components/common/page-wrapper`. Never use arbitrary or mismatched max-widths like `max-w-7xl`, `max-w-6xl`, or `max-w-5xl` for main page containers.

## 🚫 Common AI Anti-Patterns (Strictly Forbidden)

1. **NO Redundant React Hook Form**: We strictly use `@tanstack/react-form` + `Zod v4`. Do not import or suggest `react-hook-form` or `@hookform/resolvers`.
2. **NO Outdated Zod 3 Syntax**: Always use modern Zod v4 syntax: `z.email({ error: "..." })` instead of `z.string().email({ message: "..." })`.
3. **NO Small Button Size (`size="sm"`)**: NEVER use `size="sm"` or `size="xs"` for buttons anywhere in the app. Use `size="default"`, `size="lg"`, or `size="xl"`.
4. **NO Direct State Mutation**: Always use immutable updates and TanStack Query cache invalidations.
5. **NO Silent Error Swallowing**: Always log or handle errors using `getErrorMessage()` and `errorToast()`.
6. **NO className overrides on shadcn components**: Covered by the **🎨 Shadcn UI Rules** above — never pass visual overrides (background, border, padding, typography) to `<Button>`, `<Card>`, `<Input>`, etc. Only layout classes like `w-full`, `flex`, `grid` are allowed.

## 📱 Responsive Design Rule

1. ALWAYS follow a mobile-first approach. Use base Tailwind utility classes for mobile screens and apply breakpoints (`sm:`, `md:`, `lg:`) for larger screens.

## 🛡️ TypeScript & Error Handling Rules

1. ALWAYS use `error: unknown` in `catch` blocks instead of `error: any` to satisfy strict linting rules.
2. When extracting error messages, use the shared `getErrorMessage(error, fallback?)` helper from `@/lib/error` (see Anti-Pattern #5) and always pass a contextual fallback, e.g. `getErrorMessage(err, "Login failed")`. Only inline the `error instanceof Error ? error.message : "Fallback message"` check where that helper is not available.

## 💡 Naming & Code Conventions

1. Utility functions, helpers, and handlers MUST use `camelCase` (e.g., `addToast`, `formatDate`, `getInitials`). NEVER use `PascalCase` for regular functions.
2. Components, Types, and Interfaces use `PascalCase`.
3. API Client calls should live in `src/services/api/` and React Query hooks in `src/services/hooks/`.
4. Forms use `@tanstack/react-form` with Zod v4 schemas in `src/validations/`.

---

# 🧠 Agent Skills Execution Matrix (Addy Osmani)

Each phase of development in this project MUST invoke and follow the corresponding skill workflow:

| Development Phase / Scenario         | Skill to Invoke                            | Mandatory Workflow / Action                                                                                                   |
| ------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Requirement Gathering & Clarity**  | `interview-me` / `spec-driven-development` | Never guess requirements; ask focused questions and define data contracts before coding.                                      |
| **Breaking Down Tasks**              | `planning-and-task-breakdown`              | Decompose features into atomic, testable, dependency-ordered tasks (Types ➔ Validations ➔ API ➔ Hooks ➔ UI).                  |
| **Grounding in Official Docs**       | `source-driven-development`                | Ground every library (Next.js 16, React 19, Zod 4, TanStack) using the Context7 MCP server. Never rely on outdated patterns.  |
| **UI & Component Architecture**      | `frontend-ui-engineering`                  | Mobile-first, strict semantic CSS variables, zero hardcoded colors, strict Shadcn CVA variants, WCAG AA accessible.           |
| **API, Schema & Network Layer**      | `api-and-interface-design`                 | Clean DTOs in `types/`, Zod 4 schemas in `validations/`, typed `ofetch` in `services/api/`, React Query in `services/hooks/`. |
| **Executing Code Changes**           | `incremental-implementation`               | Thin vertical slices — write types and tests, build incrementally, verify build after each change.                            |
| **Handling Bugs & Build Failures**   | `debugging-and-error-recovery`             | Stop-the-line rule. Reproduce, localize, fix root-cause (never suppress errors or patch symptoms).                            |
| **Pre-Merge & Quality Gate**         | `code-review-and-quality`                  | 5-axis review checking for hardcoded styles, unused code, memory leaks, and adherence to L2B7A7 rules.                        |
| **Authentication & Sensitive Logic** | `security-and-hardening`                   | Sanitization, secure cookie storage, CSRF headers, anti-enumeration messages, and OWASP Top 10 compliance.                    |
| **Refactoring & Cleanups**           | `code-simplification`                      | Reduce nesting, remove dead code, maintain Chesterton's Fence principle.                                                      |
