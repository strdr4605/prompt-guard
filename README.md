# PromptGuard

Browser extension that monitors ChatGPT for email addresses in prompts. Detects emails before sending, lets users mask (anonymize) or dismiss them.

## Features

- Intercepts ChatGPT prompts before sending
- Detects email addresses via regex
- **Mask & Send** - replaces emails with `[EMAIL_ADDRESS]`
- **Dismiss** - skip email for 24 hours
- **Cancel** - block request, copy prompt to clipboard
- History of masked emails

## Tech Stack

- [WXT](https://wxt.dev/) - cross-browser extension framework
- React + TypeScript + Redux Toolkit
- Tailwind CSS + Headless UI

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         ChatGPT Page                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────┐      postMessage       ┌───────────┐ │
│  │   MAIN World         │ ◄──────────────────►   │  ISOLATED │ │
│  │   (injected.ts)      │                        │   World   │ │
│  │                      │                        │ bridge.ts │ │
│  │  • Override fetch    │                        │           │ │
│  │  • Block requests    │                        │ • Mount   │ │
│  │  • Show toast        │                        │   Modal   │ │
│  │                      │                        │ • Storage │ │
│  └──────────────────────┘                        └─────┬─────┘ │
│                                                        │       │
└────────────────────────────────────────────────────────┼───────┘
                                                         │
                                          browser.runtime.sendMessage
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │  Service Worker  │
                                              │  (background.ts) │
                                              │                  │
                                              │  • Detect emails │
                                              │  • Anonymize     │
                                              └──────────────────┘
```

**MAIN World** - overrides `window.fetch`, blocks requests, waits for user action

**ISOLATED World** - has browser API access, mounts React modal in Shadow DOM

**Service Worker** - email detection and anonymization logic

## Message Flow

1. User submits prompt in ChatGPT
2. `injected.ts` intercepts fetch, blocks request
3. Bridge forwards to service worker for email detection
4. If emails found, modal opens
5. User chooses: Mask / Dismiss / Cancel
6. Request proceeds (modified/unchanged) or rejected

## Development

```bash
npm install
npm run dev           # hot reload
npm run build         # build for chrome
npm run build:firefox # build for firefox
npm test              # unit tests
```

## Load Extension

**Chrome**: `chrome://extensions` → Load unpacked → `dist/chrome-mv3`

**Firefox**: `about:debugging` → Load Temporary Add-on → `dist/firefox-mv2/manifest.json`
