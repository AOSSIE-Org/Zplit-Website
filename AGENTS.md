<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Zplit Website

This is the codebase for the Zplit website, an open-source decentralized payment splitting mobile app built with Flutter. Zplit prioritizes user data privacy, offline functionality, and peer-to-peer synchronization.

## 🛠️ Stack & Commands

- **Stack:** Next.js 16.2.11 App Router (Turbopack), React 19, Tailwind CSS v4, `next-intl` (i18n), `next-themes` (light/dark state manager).
- **Build:** `npm run build`
- **Develop:** `npm run dev`

---

## 🎨 Styles & Theme System

- **Class-Based Dark Mode:** Tailwind CSS v4 is configured for class-based overrides using `@custom-variant dark (&:where(.dark, .dark *))` in [`globals.css`](src/app/[locale]/globals.css).
- **Semantic Tokens:** Do **not** write inline layout dark utilities (e.g., `dark:bg-black` or `dark:text-zinc-50`). Always write semantic classes linked to the central theme variables (e.g., `bg-background-primary`, `text-foreground-primary`).
- **Typography:** The default font family is **Inter**. It is mapped to `--font-sans` in globals.css.

---

## 🌐 i18n & l10n Routing

- **Dynamic segment:** All localized pages and layouts must be nested inside [`src/app/[locale]/`](src/app/[locale]/).
- **Awaiting params:** Layout and Page `params` props are Promises in Next.js 15/16. Always `await params` before accessing `locale`.
- **Static Export:** Call `setRequestLocale(locale)` in layout and page server components, and export `generateStaticParams()` to support static HTML export (`output: 'export'`).
- **Navigation:** Never import `Link`, `useRouter`, or `usePathname` from standard `next/link` or `next/navigation`. Always import them from local configuration helpers in [`src/i18n/navigation.ts`](src/i18n/navigation.ts).

---

## 📦 Project Boundaries

- **Config alias map:** Webpack & Turbopack alias resolvers are manually defined in [`next.config.ts`](next.config.ts) mapping `"next-intl/config"` to our local request setup. Do not import the native `@swc/core` compiler plugin wrapper `createNextIntlPlugin` directly to avoid security policy native module blocks.
- **External Links:** Never hard-code outbound URLs (Play Store, GitHub, Discord, socials) in components. Add them to [`src/config/links.ts`](src/config/links.ts) and import `SITE_LINKS`.
- **Brand Icons:** lucide-react no longer ships brand marks; use `BrandIcon` from [`src/components/icons/BrandIcon.tsx`](src/components/icons/BrandIcon.tsx).
- **Dark surfaces:** The features showcase card and footer are dark in both themes. Style them with the `showcase-*`, `footer-*` and `accent-*` tokens (never raw hex classes). `FeatureVisuals.tsx` is the one intentional exception: it draws fixed-palette "app screens".
- **Pinned layouts:** Use the `tall:` custom variant (min-height 860px) for height-dependent spacing inside sticky/pinned sections.
- **Motion:** Respect `useReducedMotion()` / `motion-reduce:` and pause or unmount off-screen animations (see `LazyVisual`, `MeshCanvas`).
- **Branding Assets:** The official branding logo, favicon, and style specifications reside inside [`public/brand/`](public/brand/).

