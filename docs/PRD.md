# Product Requirements Document (PRD)

## Digital Agency Website — AI-Driven Design System

---

## 1. Overview

This project is a digital agency website built with:

- Next.js (version from package.json: dependencies.next)
- Tailwind CSS (devDependencies.tailwindcss)
- TypeScript (devDependencies.typescript)
- Base UI (dependencies.@base-ui/react or @base-ui-components/react)

The goal is to create a **strict, token-driven design system** that enables reliable UI generation using AI tools (Cursor, Figma MCP).

This document defines the **rules AI must follow when generating UI and code**.

---

## 2. Core Principles

### 2.1 Design System First

- All UI must use defined tokens
- No arbitrary values allowed

### 2.2 Deterministic AI Output

- AI must generate predictable, repeatable code
- No “creative” styling decisions

### 2.3 Semantic Over Visual

- Always use semantic tokens (e.g. `background`, `foreground`)
- Never use raw values (hex, px, etc.)

### 2.4 Composition Over Duplication

- Build UI using reusable components from `/ui`
- Avoid inline or one-off solutions

---

## 3. Design Tokens

---

### 3.1 Colors

Color tokens are defined in Figma and mapped to Tailwind.

#### Core tokens:

- `background`
- `background-subtle`
- `foreground`
- `foreground-subtle`
- `foreground-emphasis`
- `muted-background`
- `muted-foreground`
- `ring`

#### State tokens:

- `success`, `success-subtle`, `success-emphasis`
- `destructive`, `destructive-subtle`, `destructive-emphasis`

#### Accent tokens:

- `accent-1` → primary highlight
- `accent-2` → hover / emphasis
- `accent-3`, `accent-4`, `accent-5` → supporting accents

#### Component tokens:

Buttons use dedicated tokens:

- `button-primary-*`
- `button-secondary-*`

---

### 3.2 Token → Tailwind Mapping

AI must use these mappings:

```tsx
bg - background;
bg - background - subtle;
text - foreground;
text - foreground - subtle;
text - foreground - emphasis;
bg - muted - background;
text - muted - foreground;
ring - ring;
```

---

### 3.3 Typography

#### Font Family

- `PP Frama`

#### Type Scale

AI must map semantic roles to:

- `display-large` → hero headlines

- `display-medium`

- `display-small`

- `headline-large` → page titles

- `headline-medium`

- `headline-small`

- `title-large`, → component titles

- `title-medium`,

- `title-small`

- `subline-large`, →

- `subline-medium`,

- `subline-small`

- `body-large` →

- `body-medium` → default text

- `body-small` → captions

- `label-large`, `label-medium`, `label-small` → buttons, UI labels

#### Font Weights

- `regular` (400)
- `black` (900)

---

### 3.4 Spacing

Spacing uses Tailwind scale only.

---

### 3.5 Radius

Only allowed values:

- `rounded-lg`
- `rounded-3xl`

---

### 3.6 Borders

Only allowed values:

- `border`
- `border-2`

---

## 4. Layout System

---

### 4.1 Layout Widths

- `content`
- `wide`

---

### 4.2 Container

All sections must use:

```tsx
<div className="max-w-content mx-auto px-6">
```

---

### 4.3 Section Spacing

- Default → `py-24`
- Dense → `py-16`

---

### 4.4 Grid & Flex

- Use Tailwind grid or flex
- Default gap → `gap-8`
- Large sections → `gap-12` or `gap-16`

---

## 5. Component Architecture

---

### 5.1 Folder Structure

```
/components
  /ui        → primitives (Button, Card, etc.)
  /blocks    → composed sections (Hero, Services, etc.)
```

---

### 5.2 Rules

- `/blocks` must only use `/ui` components
- No duplicated logic
- No inline styling
- No arbitrary Tailwind values

---

## 6. Component Rules

---

### 6.1 Button

#### Variants:

- `primary`
- `secondary`
- `ghost`

#### Behavior:

**Primary**

- Uses `button-primary-*` tokens
- High emphasis

**Secondary**

- Uses `button-secondary-*` tokens
- Lower emphasis or outlined

**Ghost**

- Uses `button-ghost-*` tokens
- Used for tertiary actions, inline UI controls and non-critical actions

---

## 7. Interaction Rules

All interactive elements MUST include:

- hover state
- focus-visible state
- active state
- disabled state

### Focus

Must use:

```tsx
focus-visible:outline-none focus-visible:ring-2 ring-ring
```

### Hover / Active

Must use token-based colors:

- no opacity hacks unless defined

---

## 8. Accessibility

- If a component exists in the Base UI library, use it

- All components must be keyboard accessible

- All focus states must be visible

- Use semantic HTML elements

---

## 9. Animation

- Prefer CSS transitions
- Keep motion minimal
- Avoid heavy animation unless specified

---

## 10. Code Conventions

---

### 10.1 General

- Use TypeScript
- Use functional components
- Use named exports

---

### 10.2 Styling

- Tailwind only
- No inline styles
- No CSS modules

---

### 10.3 Class Handling

- Use `cn()` utility

---

### 10.4 Props

- Always type props
- Always support `className`

---

## 11. AI Generation Rules (CRITICAL)

When generating UI, AI MUST:

1. Use components from `/ui`
2. Use semantic tokens only
3. Follow spacing rules (`tight`, `default`, etc.)
4. Use correct typography scale
5. Respect layout system (container, widths)
6. Include all interaction states
7. Never invent new tokens or values

---

## 12. Strict DO / DON'T

### DO:

- Use semantic color tokens
- Use defined typography scale
- Use Tailwind spacing scale
- Use existing components

### DO NOT:

- Use arbitrary values (e.g. `px-[18px]`)
- Use raw colors (e.g. `#000`)
- Create new tokens
- Inline styles
- Skip accessibility states

---

## 13. Example: Hero Section

```tsx
<section className="py-24">
  <div className="max-w-7xl mx-auto px-6">
    <div className="max-w-3xl flex flex-col gap-8">
      <h1 className="text-foreground headline-large">We build digital experiences</h1>

      <p className="text-foreground-subtle body-large">
        A creative agency focused on design and technology.
      </p>

      <div className="flex gap-8">
        <Button variant="primary">Start a project</Button>
        <Button variant="secondary">View work</Button>
      </div>
    </div>
  </div>
</section>
```

---

## 14. UI Implementation Patterns (CRITICAL FOR AI)

This project uses a shadcn-style architecture built on top of Base UI components and `class-variance-authority` (CVA) where appropriate.

AI must follow these implementation patterns strictly when generating components.

---

## 14.1 General Component Pattern

UI components should follow these conventions:

- use TypeScript
- use `React.forwardRef` when the primitive supports refs
- use `cn()` for class merging
- use Base UI primitives where relevant
- use `cva()` only when the component has meaningful visual variants or sizes

---

## 14.2 CVA Usage Rule

CVA is not mandatory for every component.

Use `cva()` when:

- a component has multiple variants
- a component has multiple sizes
- a component has structured state-based styling that benefits from a variant API

Do not use `cva()` when:

- a component has only one visual style
- styling is static and simple
- adding variants would create unnecessary abstraction

---

## 14.3 Variant API Rule

All components must:

- Support `className`
- Use `ref` props as in (https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)

Not all components must support:

- `variant`
- `size`

These props should only exist when they are meaningful for that component.

### Examples

A `Button` may support:

- `variant`
- `size`

A `Drawer` may support:

- `variant`
- `direction`

A `Card` may have:

- no variants initially
- optional CVA later if variants are introduced

---

## 14.4 Button Pattern

The Button component is a reference implementation for a component with:

- variants
- sizes

AI must reuse the existing Button component instead of recreating button styles inline.

---

## 14.5 AI Constraints (STRICT)

When generating UI, AI must:

- use existing `/ui` components first
- preserve each component’s existing API
- not invent `variant`, `size`, or any other props when they do not already belong to the component
- not force all components into the same abstraction pattern
- use CVA only where it improves consistency and maintainability

---

## 14.7 DO / DON'T

### DO

- use CVA for Button, Badge, Alert, or similar multi-variant components
- keep simple components simple
- match the implementation pattern already established in `/ui`

### DO NOT

- add `variant` to every component by default
- add `size` props where they are not needed
- wrap static styling in CVA without a clear reason

---

## 15. Future Extensions

- Dark / light mode switching (already supported via tokens)
- Motion system (GSAP optional)
- CMS-driven components (Sanity)

---
