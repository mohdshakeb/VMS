# Documentation Context — VMS

## Documentation Standards

- Write in plain, concise language. No jargon unless the audience expects it.
- Use present tense ("The app displays..." not "The app will display...").
- Include visuals (screenshots, GIFs) for interaction-heavy features.
- Keep docs in sync with the code — update docs in the same PR as code changes.

## Document Types and Audiences

### Client-Facing Docs
- **Audience:** Client stakeholders reviewing the prototype
- **Tone:** Professional, task-oriented. Avoid technical jargon.
- **Structure:** Organized by role and user flow, not by component.
- **Location:** `docs/client/`

### Technical Reference
- **Audience:** Developers who will build the production app based on this prototype
- **Tone:** Technical, precise
- **Structure:** Organized by feature area and component
- **Location:** `docs/reference/`

### Handoff Documentation
- **Audience:** Client dev team building the production VMS
- **Tone:** Clear and thorough — assume no prior context with the prototype codebase
- **Location:** `docs/handoff/`

### Changelog
- **Audience:** Client and contributors
- **Format:** Keep a Changelog (keepachangelog.com) format
- **Group by:** Added, Changed, Fixed, Removed
- **Location:** `docs/CHANGELOG.md`

## How Docs Relate to Code

- Each role's flow should have a corresponding walkthrough doc in `docs/client/`
- Component patterns and design decisions documented in `docs/reference/`
- Handoff docs map prototype screens to production requirements

## Design System

- **`docs/design-system.md`** — Full token reference: typography scale, colour palette, semantic aliases, badge triads, and VMS visit status colour mapping. Generated from `docs/textStyles.json` + `docs/Colour Palette.json` (GSS Design / Mintways source files).
- **`src/index.css`** — Tailwind v4 `@theme` block containing all design tokens as CSS custom properties. This is the single source of truth for tokens in the codebase.

## Skills

Skills relevant when working on documentation in this workspace.

- **`doc-authoring-skill`** — Invoke when writing or updating user-facing documentation
