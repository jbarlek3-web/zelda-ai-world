# Project TODO — Legend of the Americas

## 1. Project Foundation
- [x] Initialize WebDev React project (`web-static`)
- [x] Install `@babylonjs/core` and dependencies
- [x] Implement `GameCanvas.tsx` host component
- [x] Define shared constants and types in `shared/game/`

## 2. World & Biome Simulation
- [ ] Implement Simplex/FBM noise-based terrain generation
- [ ] Define biome classification logic (Tundra, Savannah, Rainforest, Desert)
- [ ] Build chunk-based procedural loading and mesh baker
- [ ] Implement `GridMap` building system for tribal structures

## 3. Entity & Mechanics Layer
- [ ] Implement player movement (WASD/Gamepad) and dodge roll
- [ ] Implement melee (Club/Spear) and ranged (Bow/Sling) combat
- [ ] Build enemy AI (Skulltulas, Moblins, Boss) using Behavior Tree logic
- [ ] Implement survival loops (Hunting, Gathering, Crafting)

## 4. Systems & Economy
- [ ] Implement trade route and resource scarcity simulation
- [ ] Build faction loyalty and political state machine
- [ ] Wire LLM-backed dynamic dialogue for NPCs
- [ ] Implement legal/justice system (Imprisonment, Exile, Diplomacy)

## 5. UI & Persistence
- [ ] Build responsive HUD (Hearts, Minimap, Inventory)
- [ ] Implement screen stack (Title, Pause, Settings)
- [ ] Wire database-backed save/load persistence
- [ ] Verify safe-area and focus navigation across viewports

## 6. Finalization & Delivery
- [ ] Generate final pixel-art texture atlases and sprite sheets
- [ ] Run full test suite and visual verification screenshots
- [ ] Save final checkpoint and publish to `*.manus.space`

## 7. Aurastria Master-Prompt Scope
- [x] Rename planning canon to `Aurastria: Spirits of the First Dawn` and reconcile the prior project title as a working codename
- [x] Author eight macro-region specifications, including ecology, settlement patterns, political structures, spirit-realm rules, and accessibility landmarks
- [ ] Define settlement progression from founding camp to village, town, city-state, and confederation without rewarding extractive or imperial play as the default optimal path
- [ ] Model buildings and infrastructure as data: Longhouses, Earth Lodges, Granaries, Sweat Lodges, Council Houses, Docks, Workshops, roads, irrigation, fortifications, naval infrastructure, and agricultural expansion
- [ ] Create a resource-and-stewardship economy for wood, stone, clay, hides, fibers, metals, crops, fish, knowledge, and ceremonial obligations
- [ ] Design eight representative faction archetypes, each with governance, values, relations, trade specialties, and non-stereotyped visual direction
- [ ] Define spirit-based abilities, contracts, purification, dreamwalking, and elemental blessings with explicit consent, cultural-review, and content-safety boundaries
- [ ] Create an authored main-story spine, repeatable regional quest framework, and dungeon templates with teaching, pacing, gating, and anti-soft-lock validation
- [x] Specify AI simulation contracts for NPC goals, faction loyalty, trade, law, diplomacy, navigation, and player-consequence safeguards
- [x] Create an art-prompt bible for regions, settlements, characters, creatures, gear, temples, dungeons, and spirit realms using fictional cultures rather than pan-Indigenous amalgams
- [x] Establish an Indigenous cultural-review process before final narrative, art, language, ceremony, and sacred-site content are approved

## 8. Cinematic World-Art Direction
- [ ] Translate the supplied world-map composition into an original Aurastria atlas with fictional region names, non-derivative geography, and no borrowed symbols or labels
- [ ] Establish per-region cinematic biome palettes, fog density, sky conditions, emissive accents, and landmark silhouettes for the river, volcanic, void, ocean, and rainforest themes
- [ ] Produce original visual targets for the Ember Wastes, Verdant Deep, Pelagunn Shelf, and northern fracture regions without copying the reference architecture or labels
- [ ] Upgrade Babylon rendering with selective terrain variation, instanced vegetation and rocks, atmospheric depth, water treatment, and performance budgets for browser delivery
- [x] Build an interactive world-atlas screen that communicates regional progression, travel routes, and elemental identity while remaining accessible at mobile and desktop breakpoints

## 8A. Original World Atlas
- [x] Define original named atlas regions, element palettes, unlock states, and concise accessibility labels without reusing supplied reference labels or symbols
- [x] Build a mobile-first atlas panel with a readable Great River Spine route, locked regional previews, and return navigation to the title journey flow
- [x] Add browser-like atlas navigation coverage and verify the atlas remains readable at 375×812 and desktop viewport sizes
- [x] Add a Home/title-flow integration test that opens the atlas, verifies the current and sealed route states, and returns to the title screen
- [x] Extract browser-safe atmosphere, weather, camera, and environmental-motion cues from the supplied video reference and translate them into original Aurastria effects
- [x] Analyze the two additional video references and consolidate their reusable atmosphere and motion principles into the original Aurastria specification
- [ ] Implement and profile the approved Great River Spine art-direction pass: fog, landmark focal hierarchy, terrain material variation, instanced foliage, water motion, and capped ambient particles
- [x] Convert repeated Great River Spine foliage and rock details to Babylon instances or thin instances without regressing the visual composition
- [x] Record a measured browser frame-time or rendering-cost check for the Great River Spine art pass before closing its performance task

## 9. Great River Spine Playable-Loop Pass
- [x] Capture a live render-budget sample after a stable browser warm-up and record the 60 FPS / 16.67 ms target comparison
- [x] Add an immediate, readable objective-feedback loop: discover the Tideglass Beacon, receive a clear settlement need, and return to the founding camp for a deterministic reward state
- [x] Add performance-safe anticipation, arrival, and hold timing to the beacon interaction without overriding player camera control or violating reduced-motion preferences

## 9A. Founding-Loop Completion
- [x] Define an explicit Tideglass → gathering → river-wisp → return-to-camp transition graph with an idempotent reward and a safe recovery path
- [x] Gate the founding reward on both collection requirements and river-wisp resolution, then communicate the completed season state in the mobile HUD
- [x] Add focused transition tests for the completed reward, repeat interaction, and defeat-recovery branches
- [x] Exercise the integrated `settle-wisp` safe-return branch, retaining gathered materials and allowing the player to continue the gated founding loop afterward (verified via pure-function adapter boundary tests)
- [ ] Visually verify the live settle-wisp safe-return path in the browser: defeat triggers camp teleport, HUD retains materials, and the founding loop can still complete

## 10. Survival-Crafting Input and HUD Slice
- [x] Implement data-driven move, interact, gather, and pause actions with keyboard and gamepad mappings plus graceful device fallback
- [x] Add deterministic reed and stone resource nodes, collection validation, and a small starting-inventory state for the first crafting objective
- [x] Build an event-driven, safe-area-aware exploration HUD for objective state, gathered materials, interaction affordances, and current input hints
- [x] Refactor interact, gather, and pause to consume the shared input-action mapping contract instead of hardcoded scene-specific key and gamepad button checks
- [x] Add a concrete starting inventory state, update it on each collection, and expose its resource counts through the HUD state

## 10D. Dodge-Roll Slice
- [x] Define a shared dodge-roll action with keyboard, gamepad, and touch mappings; a bounded cooldown; and world-edge clamping
- [x] Implement scene-level roll movement, reduced-motion-safe presentation, and shared HUD readiness feedback
- [x] Add focused action/roll tests and verify the control is readable at mobile viewport size
- [x] Extract roll displacement, cooldown, and edge clamping into a pure deterministic module with unit tests

## 10E. Seeded Determinism Audit
- [x] Audit generation paths for `Math.random` leakage and confirm world art, motes, and dungeon topology derive from the seed
- [x] Assert the same seed reproduces an identical world grid across repeated runs and differs across seeds
- [x] Add a reachability validator (walkable flood fill, unreachable reporting, nearest reachable substitute) with unit tests
- [x] Pass an explicit world seed into the scene instead of generating terrain from an implicit default
- [x] Seed gather-node placement from the world seed and prove identical resource layouts across repeated runs
- [x] Validate the full spawn → Tideglass → camp chain in one walkable region and fail loudly when invalid

## 10F. Measured Mobile Performance Budget
- [x] Record a warm-up-stable frame-time, draw-call, and active-mesh sample against the 60 FPS / 16.67 ms mobile budget
- [x] Measure the scene's own CPU share of the frame to distinguish scene-bound from presentation-bound frames
- [x] Bound per-pixel lighting cost by scoping every glow point light to its own meshes
- [x] Remove per-frame allocations from the render loop hot path (vector/array/object churn)
- [ ] Re-measure frame time on a release build on real phone hardware (sandbox presents at ~30 Hz, so it cannot verify the 60 FPS budget)

## 10A. Great River Encounter Slice
- [x] Define a deterministic river-wisp combat state machine with hit windows, recovery, defeat, and a no-soft-lock reset path
- [x] Add a mobile-safe strike action with keyboard and gamepad parity, visible cooldown feedback, and a concise combat objective
- [ ] Add a touch-readable river-wisp encounter that validates player health, defeat, and quest-reward feedback without interrupting navigation
- [x] Add a combat-specific HUD objective that transitions back to the founding objective after the river wisp is settled
- [x] Surface strike cooldown/readiness in the shared HUD for keyboard and gamepad players, not only the touch control

## 10C. First Dungeon Domain Slice
- [x] Define a deterministic room graph with entry, key room, locked-door gate, treasure room, boss room, and guaranteed solvability validation
- [x] Implement dungeon run state for keys, locked doors, chests, and clear/reset behavior with no-soft-lock guards
- [x] Add the required Skulltula, Moblin, and dungeon boss domain state machines with deterministic damage, recovery, and defeat transitions
- [x] Cover dungeon topology, key-door progress, and all required enemy transitions with unit tests before scene rendering integration
- [x] Add an explicit safe dungeon-run reset pathway and test that it clears partial progress without creating a soft-lock
- [x] Assert every required dungeon enemy passes idle → approach → windup → strike → recover → defeated with deterministic damage timing

## 10B. Guide and Game Master Narrative Slice
- [x] Connect a mobile-safe guide interaction to the existing bounded narrative endpoint with deterministic fallback copy and loading/error states
- [x] Add a contextual Game Master narration event for Tideglass attunement, gathering progress, river-wisp resolution, and safe return to camp
- [x] Test narrative fallback and rate-limit behavior without exposing raw LLM failures in the mobile HUD
- [x] Trigger Game Master narration for the player safe-return reset path and verify it appears in the mobile status ribbon
- [x] Add a client-level integration test that a narrative mutation error or rate-limit response renders deterministic fallback copy without raw provider or tRPC error text
- [x] Exercise a mocked `TOO_MANY_REQUESTS` narrative mutation through Home and assert both guide and Game Master fallback copy remain free of raw error text

## 11. Persistence and Screen Stack
- [x] Add a versioned three-slot save contract, user-scoped `aurastria_saves` table, and database migration
- [x] Implement protected save list, load, upsert, and delete procedures with user-ownership enforcement
- [x] Build an accessible title screen with save-slot selection plus pause and settings overlays that preserve the active scene state
- [x] Connect current quest/inventory/player state to the save boundary and add validated loading or fallback behavior

## 12. Mobile-First PWA and Visual Replacement
- [x] Define a mobile-first visual target that replaces the prototype grid with an original illustrated terrain style, limited palette, readable silhouettes, and coherent landmark language
- [x] Add an installable PWA manifest, maskable icons, service-worker registration, and an offline app-shell fallback
- [x] Add a user-visible install action when the browser exposes it and an explicit archive-connectivity state for offline journeys
- [x] Implement touch-first movement, interact, gather, and pause controls with safe-area placement and accessible labels
- [x] Redesign the phone HUD around a compact top status strip, bottom action cluster, and a minimap or navigation compass rather than desktop-card overlays
- [x] Replace the current terrain tiles, primitive camp meshes, and player cylinder with a cohesive low-poly or painted-sprite asset system that remains performant on mobile GPUs
- [x] Add a lightweight original Tideglass route language—dashed river-light markers and landmark emphasis—so the illustrated terrain communicates an actionable path without restoring a visible grid
- [x] Verify PWA manifest, app-shell, generated service-worker artifact, and install-prompt fallback contracts automatically.
- [ ] Verify actual offline reload and native installability in a browser or on a device; artifact tests do not claim this behavior.
- [x] Add deterministic PWA manifest, app-shell, service-worker artifact, and install-prompt contract tests.
- [x] Validate touch controls and visual readability at 375×812 and 390×844 viewports.
- [x] Maintain a stable dungeon frame-budget sample at 390×844 and record 375×812 visual evidence without overclaiming a second frame-time sample.
- [x] Code-split the Babylon gameplay runtime so the title screen and install flow open without downloading the full renderer bundle
- [x] Implement a functional mobile beacon-navigation compass or minimap that updates from the explorer and Tideglass positions
- [x] Verify the compact HUD and navigation aid remain readable and non-obstructive at 375×812 and 390×844 during active play
- [x] Record explicit visual-verification evidence for the 375×812 and 390×844 active-play HUD and compass review


## 13. Free-resource art upgrade and humanoid character pass
- [x] Audit Blender Models, GraphicBurger, OpenGameArt, Quaternius, and TextureKing pages for usable assets, formats, and redistribution terms.
- [x] Record source URLs, attribution requirements, and asset provenance in ASSETS.md before importing or adapting any third-party content.
- [x] Define a mobile-safe character asset budget for humanoid explorer, NPC, wisp, Skulltula, Moblin, and dungeon boss presentation.
- [x] Replace the flat explorer marker stack with a readable humanoid 3D character while preserving a procedural fallback.
- [x] Add a cohesive humanoid presentation for the explorer and camp guide without using real-world Indigenous symbols, ceremonial dress, or sacred-site references.
- [x] Add a cohesive low-poly presentation for Skulltulas, Moblins, and the dungeon boss without using real-world Indigenous symbols, ceremonial dress, or sacred-site references.
- [x] Improve camp, beacon, and gather-node silhouettes so the Great River Spine slice reads as a finished low-poly action-adventure scene.
- [x] Add scene-rendered Skulltula, Moblin, and dungeon-boss silhouettes in the deterministic dungeon preview runtime.
- [x] Reuse or adapt only assets with verified redistribution terms; do not ship unverified third-party downloads.
- [x] Re-run typecheck, tests, mobile screenshots, and frame-budget sampling after the art pass.
- [x] Save an art-upgrade checkpoint with source provenance and measured mobile performance.


## 14. Dungeon visual runtime
- [x] Define deterministic room-to-world composition and encounter placement within a mobile geometry budget.
- [x] Implement original low-poly Skulltula, Moblin, and dungeon-boss visual builders with shared materials.
- [x] Add deterministic dungeon preview/runtime scene wiring to the existing first-dungeon domain state.
- [x] Add key door, treasure, encounter, and boss landmark presentation.
- [x] Add mobile HUD/readiness feedback for dungeon encounter actions.
- [x] Test dungeon visual determinism and encounter transitions with focused runtime tests plus the full regression suite.
- [x] Capture active-play responsive mobile readability with the dungeon-ready HUD and action cluster at 390×844.
- [x] Capture a stable dungeon-focused mobile frame-budget sample after adding the development-only encounter focus path.
- [x] Save a dungeon visual runtime checkpoint with measured results.
- [x] Wire Babylon dungeon visuals to FirstDungeonRun so current room, key pickup, locked-door opening, chest state, and boss defeat update from domain transitions.
- [x] Add encounter visual state synchronization so Skulltula, Moblin, and boss visuals respond to DungeonEnemyState phases.
- [x] Add focused scene/domain tests for key, door, chest, boss, and encounter-phase transitions.
