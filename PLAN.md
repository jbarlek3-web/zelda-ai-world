# PLAN.md — Aurastria: Spirits of the First Dawn

## 1. Executive Summary & Vision
**Aurastria: Spirits of the First Dawn** is an expansive open-world action-adventure game inspired by the exploration, tool-gating, dungeon pacing, and discovery loop of classic action adventures. It is set in an original mythic-fantasy continent shaped by the lands and ecological relationships of the pre-colonial Americas. The player begins as a lone wanderer, builds reciprocal relationships with communities and landscapes, and may lead a settlement, city-state, or confederation. “Legend of the Americas” is retained only as an internal working codename.

Built on Babylon.js (with React as the picture frame and Babylon as the canvas), the architecture enforces robust separation of concerns, strict type safety, event-driven HUD updates, and immersive simulation systems.

---

## 2. Risk Decomposition & Mitigation
1. **Procedural World & Biome Generation (High Risk):**
   - *Risk:* Performance bottlenecks and visual repetition across massive multi-biome terrain.
   - *Mitigation:* Use chunk-based procedural terrain loading with layered Simplex/FBM noise, deterministic seeding, and optimized mesh merging.
2. **AI NPC Faction & Economy Simulation (High Risk):**
   - *Risk:* Unpredictable state drift or excessive CPU overhead from complex tribal politics and trade routes.
   - *Mitigation:* Implement a lightweight tick-based event scheduler for background economic and political simulation, decoupling AI decision frequency from render frames.
3. **Responsive UI & Controller/Keyboard Navigation (Medium Risk):**
   - *Risk:* UI breaking across mobile/ultrawide viewports or lacking gamepad focus support.
   - *Mitigation:* Adopt the `game-ui-ux` skill architecture: anchors + containers, reference resolution scaling, safe-area insets, and explicit focus navigation stacks.
4. **Combat & Survival Physics (Medium Risk):**
   - *Risk:* Sluggish melee hits or inaccurate projectile arcs (bows, slings, spears).
   - *Mitigation:* Implement deterministic raycast/sphere-cast collision checks and clear windup/strike/recovery animation frames.

---

## 3. Development Phases
- **Phase 1: Foundation & Architecture:** Establish shared constants, types, world gen mathematics, and state stores.
- **Phase 2: Asset & Texture Generation:** Produce high-quality pixel-art sprite sheets and texture atlases via Manus image generation and offline chroma-keying.
- **Phase 3: Render & Scene Layer:** Build Babylon camera rigs, lighting environments, terrain mesh bakers, and entity renderers.
- **Phase 4: Gameplay Mechanics & Survival Systems:** Implement player movement, dodge rolls, melee/ranged combat, resource gathering, and tribal crafting (Longhouses, Sweat Lodges, Granaries, Docks, Workshops).
- **Phase 5: AI NPCs, Factions & Dialogue:** Wire LLM-backed dynamic dialogue and political/trade simulation.
- **Phase 6: UI Shell & Persistence:** Assemble responsive HUD, inventory screens, save/load database integration, and WebDev publication.

## 4. Canon, Scope, and Cultural-Safety Guardrails

The game is **inspired by** Indigenous Americas rather than a simulation of a single Indigenous people, a historical reconstruction, or a pan-Indigenous fantasy. Aurastria therefore uses fully fictional nations, languages, symbols, ceremonies, names, and spiritual traditions. It must not reproduce, procedurally invent, or gamify real sacred knowledge, restricted sites, ceremonies, songs, language, regalia, or community-specific designs. Cultural references must remain traceable in an internal provenance log, while any content derived from a specific community requires documented permission, attribution, a benefit-sharing agreement, and a cultural-review sign-off before release. This reflects Indigenous Cultural and Intellectual Property principles and Indigenous data sovereignty, which emphasize community control over cultural heritage and data about their communities.[1] [2]

The primary fantasy is **stewardship, discovery, and relationship**, not conquest. Governance routes are opt-in and plural: council-led settlements, trade networks, reciprocal alliances, and defensive confederations must be viable end states. A coercive “become emperor” path cannot be mechanically dominant. Legal consequences are represented through community process, restitution, loss of trust, restricted access, and negotiated reconciliation; content must never present the cultural identity of a people as a stat, cosmetic, extraction mechanic, or a monolithic trait.

| Constraint | Design decision |
|---|---|
| Historical frame | Pre-colonial technological ceiling: no industrial motorization, firearms, or anachronistic European domestic horses. Use regionally appropriate fictional mounts, watercraft, or spirit travel where necessary. |
| Spiritual content | Fictional cosmology with universalizable themes of reciprocity, memory, landscape, and responsibility; no copied sacred rites or symbols. |
| Political content | Factions have specific institutions and material conditions rather than “tribal” stereotypes. Councils, hereditary roles, merchant leagues, and confederations are authored as distinct systems. |
| Cultural review | Paid, appropriately scoped Indigenous cultural consultants have approval gates for final art, language, lore, music, and sacred-site content. Consent is ongoing, not one-time. [1] [3] |
| Generative AI | AI may propose fictional variations only from approved internal source material; it cannot invent claims about living peoples or reproduce real cultural designs. |

## 5. World Pillars and Macro-Region Matrix

The eight macro-regions form a connected continental loop. Each has an authored “golden path,” a navigable water or land route, an optional ecological or spiritual route, a regional hub, a dungeon type, and an alliance tension. Procedural content supplies local variation, but progression, landmarks, faction arcs, and gating remain authored so generated terrain never replaces deliberate pacing.

| Region | Ecological identity | Primary traversal | Regional tension | Dungeon promise |
|---|---|---|---|---|
| Frozen Dawn Tundra | Glaciers, tundra lakes, aurora storms, migratory herds | Sled, climbing, ice navigation | Winter survival and reciprocal hunting limits | Aurora observatory and ice-cave memory labyrinth |
| Sky-Cutter Mountains | Sacred peaks, high forests, passes, springs | Climbing, gliding currents, rope traversal | Water stewardship between upland and valley settlements | Vertical shrine network that teaches wind routing |
| Verdant Spiritwood | Temperate forest, wetlands, ancient canopy | Tracking, stealth, canopy paths | Misleading paths, logging pressure, memory-keeping | Living grove whose pathways react to sound and seasons |
| Great River Spine | Floodplains, prairie, river confluences, market towns | Canoes, rafting, overland trade | Seasonal flood management and intercity agreements | River-engineered ruins with water-level puzzles |
| Jaguar-Veil Rainforest | Dense canopy, rivers, waterfalls, old cities | Swimming, climbing, vine traversal | Biodiversity protection and competing knowledge claims | Sunken temple of mirrors, sound, and rain |
| Painted Desert Wastes | Mesa, salt flats, canyon springs, mirage fields | Caravan navigation, heat shelter, sand-sailing | Water rights, drought, and oath-bound trade | Canyon observatory where light reveals routes |
| Emberback Archipelago | Volcanoes, ash forests, black-sand beaches, mythic megafauna | Sailing, thermal gliding, lava-field traversal | Evacuation, fishing rights, and volatile sacred landscapes | Fire-temple forge that rewards restraint over extraction |
| Storm-Coast Archipelago | Storm fronts, reefs, sea caves, ocean harbors | Sailing, diving, naval evasion | Piracy, rescue ethics, and shared coastal passage | Tide-locked sanctuary with current and weather puzzles |

## 6. Systems Contract

The settlement loop is **gather → craft → store → share/trade → maintain → learn**. The illustrated system reference is canon for the first playable vertical slice: Longhouses, Earth Lodges, Granaries, Sweat Lodges, Council Houses, Docks, and Workshops; resources including wood, stone, clay, hides, fibers, metals, crops, and fish; and progression through paths, roads, irrigation, defenses, maritime infrastructure, and agriculture. Each building must have a construction cost, upkeep, worker capacity, ecological effect, culture/knowledge effect, and an inspectable reason for its outcome. “Culture” is not a resource to extract or optimize; it is represented by community trust, knowledge relationships, and locally authored civic choices.

| System | Player-facing contract | Technical contract |
|---|---|---|
| Settlement building | Every placed building shows costs, placement rules, projected benefits, maintenance, and environmental impact. | Data-driven `BuildingDefinition` plus validation service; client preview is non-authoritative. |
| Economy | Barter values respond to distance, season, scarcity, trust, and obligations rather than a single coin price. | Tick-based `MarketSnapshot`; deterministic seed and auditable event ledger. |
| Governance | Councils, agreements, obligations, and disputes create opportunities and consequences. | Event-sourced `FactionRelation` and `DecisionRecord` with reversible simulation snapshots. |
| NPC AI | NPCs pursue safety, food, work, relationships, roles, and community commitments. | Blackboard/behavior-tree concepts translated to TypeScript; services update sensed facts, tasks perform actions, decorators gate priority branches. |
| Exploration | Abilities teach safely, then test through authored regional routes and dungeons. | Level graphs validate reachability, key/ability order, and absence of soft-locks before build publication. |
| Spirit abilities | Ritualized abilities solve traversal, weather, healing, and social puzzles without replacing physical play. | Explicit ability contracts, cooldown/resource validation, and no LLM authority over rewards, ranks, or inventory. |

## 7. Acceptance Criteria for the First Vertical Slice

The initial playable target is the Great River Spine starter scenario: a lone wanderer reaches a five-to-twenty-person riverside founding camp, earns trust through legal trade, fishing, gathering, and a non-lethal defense quest, constructs a longhouse, granary, council fire, workshop, and canoe dock, and navigates a water-level shrine. The slice is complete only when the player can see the world consequence of each building, resolve one council decision by more than one valid route, complete a dungeon with a taught-then-tested traversal ability, and save/load the complete settlement state. The HUD must be safe-area aware, responsive, and navigable with keyboard, mouse, and gamepad.

## References

[1] [CSIRO, “Indigenous Cultural and Intellectual Property Principles.”](https://www.csiro.au/en/about/policies/science-and-delivery-policy/indigenous-cultural-and-intellectual-property-principles)

[2] [Native Nations Institute, “Indigenous Data Sovereignty & Governance.”](https://nni.arizona.edu/our-work/research-policy-analysis/indigenous-data-sovereignty-governance)

[3] [United Nations DESA, “Free, Prior and Informed Consent.”](https://www.un.org/development/desa/indigenouspeoples/publications/2016/10/free-prior-and-informed-consent-an-indigenous-peoples-right-and-a-good-practice-for-local-communities-fao/)
