# Project Guidelines & Responsive Design System

## 1. Responsive Design - Single Source of Truth (Mandatory)
- **Unified Components**: Never write duplicate HTML/JSX or isolated CSS rule blocks specifically for mobile vs desktop.
- **Shared Base Styling**: All component layouts, colors, cards, typography, and controls must exist in the **shared base CSS** so that any visual or functional update automatically reflects across **Desktop, Tablet, and Mobile**.
- **Media Queries Policy**: 
  - Media queries (`@media`) must **only** adjust structural flow (e.g. `grid-template-columns`, `flex-direction`, padding/gap clamp).
  - Never override full component styles, colors, buttons, or nav items with isolated `!important` inside `@media (max-width: ...)` without syncing with Desktop.
- **Fluid Sizing**: Use CSS variables (`--tm-gap`, `--tm-gutter`, `--tm-card-pad`) and `clamp()` / CSS Grid `auto-fit, minmax(...)` so the layout flexes automatically across all screen sizes.

## 2. Architecture & Code Integrity
- Backend: Layered Clean Architecture (`routes` -> `middlewares` -> `controllers` -> `services` -> `repositories`).
- Frontend: React 19 + TypeScript + Vite. Keep API calls inside dedicated services in `frontend/src/services/`.
- RBAC: Always check permissions (`can(...)`) before rendering sensitive controls or executing privileged operations.
