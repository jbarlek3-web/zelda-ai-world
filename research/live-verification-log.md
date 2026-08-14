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
