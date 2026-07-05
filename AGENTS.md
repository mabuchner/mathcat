# MathCat — Agent Guide

## Vision

MathCat is a mental-arithmetic practice game for primary school students. The goal is to build **automaticity** — making basic operations on small numbers reflexive so they no longer consume conscious mental effort. Enjoyment is essential: it's what keeps kids returning long enough for that fluency to form.

## Project structure

See [README.md](README.md) for the full project structure, architecture overview, and how to run the app locally and on a phone.

## Core constraint: stay a PWA

MathCat must remain installable as a Progressive Web App on both iOS (Safari) and Android (Chrome) without any app store. Do not introduce native platform dependencies, server-side code, or build-time API calls. Everything runs in the browser; `dist/` is a static site.

## Verify your changes

Always run these three commands before considering a change complete:

```bash
npm run lint    # oxlint
npm run build   # TypeScript compile + Vite production build
npm run test    # Vitest test suite
```

## Commit messages

- Use plain imperative sentences (`Add dark mode toggle`, `Fix countdown reset on retry`)
- Focus on the functional change; omit implementation details that are visible in the diff
- Do not mention how many tests were added or coverage changes unless testing was the explicit goal
- Do not include URLs unless they are a directly relevant reference for the change
- No attribution footers, sign-offs, or AI tool mentions
