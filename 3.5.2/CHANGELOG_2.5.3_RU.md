# MISTNET 2.5.3 — lint & runtime fixes

- Fixed `next/no-html-link-for-pages` in Header and Footer using `next/link`.
- Replaced legacy `MistnetScripts.tsx` ts-nocheck usage with a typed `next/script` component.
- Replaced raw mascot `<img>` with `next/image` and priority loading.
- Moved Manrope and JetBrains Mono to `next/font/google` for self-hosted font assets.
- Removed ESLint `no-unused-expressions` patterns in the runtime.
- Removed an unused catch binding.
- Fixed a non-invoked motion-layer IIFE; mobile menu, CTA feedback and conversion tracking now initialize.
- Synced package version and lockfile to 2.5.3.
