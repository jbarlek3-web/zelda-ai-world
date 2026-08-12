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
- [ ] Build an interactive world-atlas screen that communicates regional progression, travel routes, and elemental identity while remaining accessible at mobile and desktop breakpoints
- [x] Extract browser-safe atmosphere, weather, camera, and environmental-motion cues from the supplied video reference and translate them into original Aurastria effects
- [x] Analyze the two additional video references and consolidate their reusable atmosphere and motion principles into the original Aurastria specification
- [ ] Implement and profile the approved Great River Spine art-direction pass: fog, landmark focal hierarchy, terrain material variation, instanced foliage, water motion, and capped ambient particles
- [x] Convert repeated Great River Spine foliage and rock details to Babylon instances or thin instances without regressing the visual composition
- [x] Record a measured browser frame-time or rendering-cost check for the Great River Spine art pass before closing its performance task

## 9. Great River Spine Playable-Loop Pass
- [ ] Capture a live render-budget sample after a stable browser warm-up and record the 60 FPS / 16.67 ms target comparison
- [ ] Add an immediate, readable objective-feedback loop: discover the Tideglass Beacon, receive a clear settlement need, and return to the founding camp for a deterministic reward state
- [x] Add performance-safe anticipation, arrival, and hold timing to the beacon interaction without overriding player camera control or violating reduced-motion preferences

## 10. Survival-Crafting Input and HUD Slice
- [x] Implement data-driven move, interact, gather, and pause actions with keyboard and gamepad mappings plus graceful device fallback
- [x] Add deterministic reed and stone resource nodes, collection validation, and a small starting-inventory state for the first crafting objective
- [x] Build an event-driven, safe-area-aware exploration HUD for objective state, gathered materials, interaction affordances, and current input hints
- [x] Refactor interact, gather, and pause to consume the shared input-action mapping contract instead of hardcoded scene-specific key and gamepad button checks
- [x] Add a concrete starting inventory state, update it on each collection, and expose its resource counts through the HUD state
