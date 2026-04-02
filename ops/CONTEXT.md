# Operations Context — VMS

## Infrastructure

- **Platform:** {{target platform — likely Vercel, Netlify, or static hosting for prototype}}
- **Build system:** Vite
- **CI/CD:** {{CI/CD approach — TBD, may not be needed for prototype}}
- **Signing/Auth:** N/A — prototype with simulated role switching, no real auth

## Deploy Process

### Development
1. `npm run dev` — starts Vite dev server
2. Open `http://localhost:5173` in browser
3. Use role switcher to toggle between Employee, Front Desk, Visitor Manager

### Release Build
1. `npm run build` — produces static assets in `dist/`
2. Deploy `dist/` to hosting platform
3. Verify all routes work with client-side routing fallback

### Pre-release Checklist
- All three role flows are walkable end-to-end
- Role switcher works correctly
- Responsive layout works on mobile and desktop viewpoints
- No console errors or broken routes
- Dummy data displays correctly across all screens
- Charts render on Visitor Manager dashboard
- Update `docs/CHANGELOG.md`
- Client sign-off on prototype scope

## Runbook Conventions

- Runbooks go in `ops/runbooks/`
- Each runbook covers one operational task
- Format: numbered steps, no ambiguity, copy-pasteable commands
- Include "Verify" step at the end of every runbook

## Monitoring

- N/A for prototype — no production monitoring needed
- {{Future monitoring considerations for production VMS}}

## Skills

_No ops-specific skills defined yet._
