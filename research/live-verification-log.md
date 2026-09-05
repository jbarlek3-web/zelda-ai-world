# Live Browser Verification Log

Preview URL: `https://3000-i1xgnp6ebg2vlhdjvi3z6-dbaf7f8c.us2.manus.computer`

## Title screen (verified)

The title screen renders the journey framing, install guidance, the practice-journey entry, sign-in
to archive, atlas, and settings. Control legend reads: `WASD / arrows or left stick · E / A interact
· F / X gather · J / B strike · K / Shift / Y roll · Esc / Start pause`, confirming the roll binding
is surfaced to the player.

## Entering active play (verified)

"Begin practice journey" transitions to the live Babylon view. Observed HUD state on entry:

- Objective: `Seek the Tideglass Beacon`
- Progress: `0/3 reeds · 0/2 stones`
- Satchel: `0 reeds · 0 stones`
- Vitality `3/3`, Wisp `3/3`
- `River-staff · ready`, `Roll · ready`
- Action hint: `Follow the turquoise beacon to begin the founding task.`

The illustrated terrain plate, camp token, turquoise Tideglass beacon, and river-light route markers
all render; no prototype grid is visible. The guide affordance ("Ask the river guide") is present.

### Open questions to verify next

1. Movement via keyboard actually relocates the explorer and updates the compass bearing/distance.
2. Beacon proximity swaps the action hint and permits attunement.
3. Gather → deliver → wisp encounter → safe-return path behaves as the unit tests assert.


## Humanoid Art Upgrade Verification — 2026-09-05

The clean preview loaded the mobile title screen at 390×844 after the humanoid code change, with the existing PWA shell and control legend intact. TypeScript validation, the full 86-test suite, and the production Vite/PWA build all passed.

The browser automation session repeatedly became `about:blank` immediately after clicking “Begin practice journey,” before a gameplay screenshot could be captured. This prevented a reliable active-play visual assertion in the browser; it is recorded as a verification limitation rather than treated as a passing gameplay visual check. The code path remains covered by the successful typecheck/build and the existing scene/domain tests, but the mobile active-play screenshot and post-art frame-budget sample remain open checklist items.


## Post-art mobile title verification — 2026-09-05

The title screen was captured at both 390×844 and 375×812 after the Tideglass emblem polish. The background river plate remains visible behind the title panel; the main title, install guidance, archive slots, Enter Journey, Open Atlas, and Settings actions remain readable and inside the viewport. At 375×812 the title wraps to two lines and the lower Settings control approaches the safe-area edge but remains visible; active-play mobile verification is still blocked by the preview tab resetting when the gameplay entry is clicked.

## Functional dungeon runtime verification — 2026-09-05

The deterministic dungeon layout and runtime adapter passed focused coverage for key collection, locked-door opening, chest idempotency, encounter FSM damage, and dungeon-boss defeat. The full regression suite passed with 91 tests, and the production build completed successfully. A responsive 390×844 title-screen capture remained readable after the integration. The browser’s active-play tab reset to `about:blank` immediately after the Babylon WebGL2 scene mounted; the browser console recorded the Babylon WebGL2 startup line but no explicit JavaScript or Babylon exception. The live active-play screenshot therefore remains limited by the preview browser session rather than a recorded application error.


## Active-play responsive preview — 2026-09-05

The managed preview captured the active Babylon scene directly at `/?journey=play` and 390×844. The mobile HUD remained readable, the Tideglass emblem and compass were visible, the terrain plate rendered as an illustrated river basin, the original humanoid explorer and camp-guide silhouettes were visible, and the bottom action cluster showed MOVE, USE, GATHER, STRIKE, ROLL, and PAUSE. The separate browser automation session still reset to `about:blank` when navigating or clicking into active play, so direct browser-console traversal of the dungeon sites remains unavailable.


## PWA and dual-viewport dungeon verification — 2026-09-05

The new `pwaContract.test.ts` suite passed four checks: standalone portrait manifest metadata, app-shell `navigateFallback`, mobile HTML viewport/theme contract, native `beforeinstallprompt` plus iOS/Android fallback copy, and generated `dist/public/manifest.webmanifest`/`sw.js` artifacts after production build. This is deterministic build-contract evidence; a real browser offline reload and native install prompt remain separate manual checks.

The managed preview captured the dungeon-boss focus at 375×812. The compact top HUD, Tideglass compass, illustrated river plate, dungeon shell, boss silhouette, and MOVE/USE/GATHER/STRIKE/ROLL/PAUSE action cluster remained inside the phone viewport. The latest stable render-budget sample is still the 390×844 dungeon-focused sample; the 375×812 capture is visual evidence only, so no dual-viewport frame-time claim is made.
