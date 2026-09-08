# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/styles/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Root component: phone shell and screen routing (auth vs. guardian vs. boarder)
- `src/styles/index.css` - Global CSS entrypoint; imports Tailwind CSS v4, `base.css`, and `utilities.css`
- `src/styles/base.css` - Base element rules (html/body/#root sizing, default font, tap highlight)
- `src/styles/utilities.css` - Custom utility classes (e.g. `scrollbar-hide`)
- `src/components/ui.tsx` - Shared UI kit (Avatar, chips, Header, NavBar, BottomSheet, Modal, form primitives, Toast, etc.)
- `src/features/auth/AuthScreens.tsx` - Login, register, forgot-password, and role-select screens
- `src/features/guardian/GuardianApp.tsx` - Guardian role app (dashboard, payments, attendance, security, more)
- `src/features/boarder/BoarderApp.tsx` - Boarder role app (home, payments, attendance, security, more)
- `src/lib/theme.ts` - Color tokens (`C`) used via inline styles across the app
- `src/lib/types.ts` - Shared domain types (Boarder, PaymentRecord, Announcement, etc.)
- `src/lib/data.ts` - Seed/mock data for the prototype
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

Use the `@` alias (e.g. `@/lib/theme`, `@/components/ui`) for cross-folder imports inside `src`.

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/styles/index.css` imports Tailwind with `@import 'tailwindcss';` and pulls in `base.css` and `utilities.css`. Use Tailwind utility classes directly in JSX; put base element rules in `src/styles/base.css`, custom utility classes in `src/styles/utilities.css`, and any Tailwind v4 theme customization in `src/styles/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/styles/index.css`, so global font wiring belongs in `src/styles/base.css`. Keep CSS `@import` statements first in `index.css`, then add any `@font-face` rules and font-family defaults in `base.css`.

Component colors come from the `C` token object in `src/lib/theme.ts` and are applied via inline styles; keep new colors there rather than hard-coding hex values in components.
