# MathCat 🐱

A friendly mental-arithmetic practice game covering addition, subtraction, and multiplication. Answer a problem before the countdown runs out to win a random cat picture; a wrong answer or a timeout gets a gentle encouraging message instead. Built as an installable Progressive Web App so it works the same way on Android (Chrome) and iOS (Safari, "Add to Home Screen") without any app store.

## Running it locally

```bash
npm install
npm run dev
```

This starts a local dev server over **HTTPS with a self-signed certificate** (via `@vitejs/plugin-basic-ssl`) — both iOS Safari and Android Chrome require a secure context to register a service worker, so plain `http://` won't support install/offline testing. Your browser will show a one-time "connection not private" warning; that's expected for local dev, just proceed.

## Testing on a phone over your local network

```bash
npm run dev:host
```

Then open the printed `https://<your-computer's-LAN-IP>:5173` address on the phone's browser (both phone and computer need to be on the same Wi-Fi). Accept the self-signed certificate warning, then use "Add to Home Screen" (iOS Safari) or the install prompt (Android Chrome) to install it like a native app.

## Building for production

```bash
npm run build
npm run preview
```

`npm run preview` serves the production build (with the real generated service worker) the same way `dev:host` does, and is the most accurate way to test installability and offline behavior before deploying anywhere.

Every push to `main` is automatically built and deployed to GitHub Pages via `.github/workflows/deploy.yml`, which publishes `dist/` to the root of the `gh-pages` branch (GitHub Pages must be configured to serve from that branch). The live app is at [mabuchner.github.io/mathcat](https://mabuchner.github.io/mathcat/).

### Pull request previews

`.github/workflows/pr-preview.yml` builds every pull request and deploys it to `mabuchner.github.io/mathcat/pr-<number>/` (a `pr-<number>/` folder on the `gh-pages` branch), posting the link as a PR comment. The preview is rebuilt on every push and deleted when the PR is closed. For security, previews are only built for branches in this repository — pull requests from forks get regular CI but no preview, because building untrusted code with a write-capable token could alter the deployed site.

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

## How it works

- **Cat images** come from [cataas.com](https://cataas.com) via a plain `<img>` tag (no API key, no CORS issues). If the network is unavailable, a bundled illustrated cat (`src/cats/fallback-cat.svg`) is shown instead.
- **Sound effects** are synthesized at runtime with the Web Audio API — no audio files are bundled or downloaded.
- **Settings** (which operations and numbers to practice, countdown duration, sound/ticking toggles) are stored in the browser's `localStorage`.

## Project structure

- `src/game/` — pure game logic: problem generation, the phase state machine, the countdown hook.
- `src/settings/` — persisted user settings.
- `src/cats/` — random cat image URL builder + offline fallback.
- `src/sound/` — Web Audio synthesized sound effects.
- `src/components/` — UI: the keypad, problem card, countdown ring, reward/encouragement screens, settings panel.
