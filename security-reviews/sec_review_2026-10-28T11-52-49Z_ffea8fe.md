# Security Review Report

- **Reviewing agent / model:** Claude Opus 5.5 (claude-opus-5-5), running as a Claude Code subagent
- **Reasoning effort / tier:** not disclosed by the runtime
- **Review date and time:** 2026-10-28T11:52:49Z (UTC)

## Scope

Full-repository review of `Zplit-Website` (the user asked for the whole repository, not a diff), so every vulnerability found is in scope, not only new ones. Reviewed commit: `ffea8fe81587166e1341a089c45653d7a52709bb` (`git rev-parse HEAD`, branch `fix/instant-root-redirect`). The review covers HEAD plus the uncommitted working-tree changes `git status` shows: modified `AGENTS.md`, `README.md`, `src/app/(root)/layout.tsx` and `src/app/(root)/page.tsx` (an inline `location.replace` redirect on `/`), and the untracked `skills/` folder.

Project types detected: **Frontend (Next.js / React / Tailwind)**. Signals: `next.config.ts` with `output: "export"`, `next` 16.4.3 in `package.json`, Tailwind v4 via `@tailwindcss/postcss`, and `.tsx` files throughout `src/`. No Solidity, ErgoScript, Svelte, Python, Go or Flutter signals were present. Checklists applied: General and Frontend (Next.js / React / Tailwind). GitHub Actions workflows (`.github/workflows/*.yml`) and `.github/dependabot.yml` were also reviewed for CI security issues.

What was reviewed: all of `src/` (app routes, components, config, i18n, message catalogs), `next.config.ts`, `package.json`, `public/` text files (`.well-known/*`, `robots.txt`, `llms.txt`), the four workflows, and the repository docs relevant to design intent (`AGENTS.md`, `SECURITY.md`, `BestPracticesChecklist.md`). Skipped as instructed: `node_modules/`, `.next/`, `out/`, lockfiles and binary assets.

Trust boundaries: the site is a static export served by GitHub Pages. It has no server runtime, no API routes, no Server Actions, no middleware, no cookies, no authentication and no user-submitted data. The only runtime inputs are the URL path (limited to the statically generated locales through `dynamicParams = false` and `generateStaticParams()`) and client-side theme state (`next-themes`). Every string rendered into the page (translations, links, JSON-LD) is fixed at build time from files in the repository. The CI boundary is the GitHub Actions runner: `ci.yml` builds untrusted PR code under `pull_request` with a read-only token; `nextjs.yml` deploys only on `push` to `main` / `workflow_dispatch`; `label-merge-conflicts.yml` runs under `pull_request_target` but never checks out or runs PR code; `scorecard.yml` uses `persist-credentials: false`.

Checked with no issue found: raw-HTML sinks (`dangerouslySetInnerHTML` in `src/app/(root)/page.tsx`, `src/app/[locale]/page.tsx` and `src/components/FaqSection.tsx` take only build-time constants or repository translation strings); `t.rich` uses in `Footer.tsx` (they return React elements, not raw HTML); outbound links (all come from the constant `SITE_LINKS` or literal fragments, and `target="_blank"` links set `rel="noopener noreferrer"`); open redirects (the `/` redirect target is the constant `"/en"`); `NEXT_PUBLIC_SITE_URL` (a public base URL, not a secret); hardcoded secrets (none; `assetlinks.json` holds public signing-certificate fingerprints by design); `next/image` remote patterns (none configured; `images.unoptimized`); `Math.random` (used only for canvas animation and decorative cipher text, never for a security value); workflow script injection (no `${{ github.event.* }}` or other attacker-controlled expression is interpolated into a `run:` step; the only interpolations are `github.workspace`, `matrix.node-version` and step outputs built from fixed strings).

## Findings

No findings met the confidence threshold (0.7) after the Step 5 exclusions were applied.

## Notes

### Note 1: Inline redirect script on `/` inserted as raw HTML — `src/app/(root)/page.tsx:22`

- Category: design-tradeoff
- Observation: The bare `/` route renders `<script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(defaultLocalePath)})` }} />`, where `defaultLocalePath` is the build-time constant `"/en"` derived from `defaultLanguage` in `src/config/languages.ts`. No URL, query, hash or other runtime input reaches the script or the `<meta http-equiv="refresh">` fallback, so there is no XSS or open-redirect path. The one concrete effect is that the site now depends on an inline script, so any future Content-Security-Policy (for example one added through a `<meta>` tag or a CDN in front of GitHub Pages) must allow it by hash or nonce rather than ban inline scripts outright.
- Rationale: This is deliberate and documented. `AGENTS.md` (Root route) says `/` uses "an inline `location.replace("/en")` that runs as soon as it is parsed" with the meta refresh kept only as a no-JS fallback, and says not to replace it with `redirect()`. The code comment at `src/app/(root)/page.tsx:8-12` explains that a static export cannot send HTTP redirects and that a meta refresh alone showed a blank page on first visits. Keep the target a constant passed through `JSON.stringify`; never build it from `location`, query or hash input.

## Limitations

**Standing limitations**

- This review does not replace a full manual audit or a penetration test.
- This is static analysis of source text. Nothing was executed, fuzzed, or traced at runtime, so timing-dependent, load-dependent, or infrastructure-dependent issues cannot be confirmed here.
- Confidence scores are the reviewing model's own self-assessment, not a calibrated statistical probability.
- Absence of a reported finding does not mean the code is secure. Safety guardrails built into some models can cause a real vulnerability to be softened, generalized, or left out rather than reported in exploit-level detail, and training-data bias can make some vulnerability classes easier for a model to recognize than others. Treat this report as a floor on what a full audit would find, not a ceiling.
- Findings reflect the reviewing model's training data cutoff. A vulnerability tied to a very recently disclosed CVE or library advisory may not be recognized as such.

**Review-specific limitations**

- Third-party dependency source (`node_modules/`, including `next`, `next-intl`, `next-themes`, `framer-motion` and `lenis`) and lockfiles were out of scope, so known advisories in resolved dependency versions were not checked. Run `npm audit` or rely on Dependabot (configured in `.github/dependabot.yml`) for that.
- The source of the third-party GitHub Actions used by the workflows (for example `eps1lon/actions-label-merge-conflict@v3`, `ossf/scorecard-action`, `actions/*`) was not available and was not reviewed. Repository and organization Actions settings, branch protection, environment protection rules on `github-pages`, and the GitHub Pages / DNS configuration live outside the repository and could not be evaluated.
- HTTP response headers (CSP, HSTS, framing) are set by GitHub Pages, not by this repository, so they could not be evaluated here.
- The untracked `skills/` folder contains agent instruction documents (`SKILL.md` files) rather than application code. It was read for this review's procedure but has no runtime security surface for the website.
