# STRUCTURE.md — Aurastria Production Architecture

## Directory Layout

```
/home/ubuntu/zelda-ai-world/
├── client/
│   ├── src/
│   │   ├── _core/             # Framework integration
│   │   ├── components/        # UI components (HUD, Minimap, DialoguePanel, ControlsCard)
│   │   ├── game/              # Game engine & simulation
│   │   │   ├── core/          # Game loop, input manager, audio manager
│   │   │   ├── entities/      # Player, enemies, NPCs, items, structures
│   │   │   ├── features/      # Building, economy, factions, survival, quests, spirits
│   │   │   ├── render/        # Babylon scene, camera, tilemap baker, sprite renderer, shaders
│   │   │   ├── scene/         # Scene orchestrator and state machine
│   │   │   └── world/         # Overworld generator, dungeon generator, biomes, pathfinding
│   │   ├── lib/               # tRPC client and utilities
│   │   ├── pages/             # Title.tsx, Play.tsx, Home.tsx
│   │   └── App.tsx            # Route definitions
├── server/                    # Express + tRPC backend
│   ├── _core/                 # Server core plumbing
│   ├── features/              # Feature routers (saves, narrative, economy, faction)
│   ├── db.ts                  # Drizzle query helpers
│   └── routers.ts             # Root tRPC router
├── shared/                    # Shared types, constants, schemas
├── drizzle/                   # Database schema & migrations
└── PLANNING / ASSETS          # PLAN.md, STRUCTURE.md, MEMORY.md, ASSETS.md, todo.md
```

## Module Boundaries & Data Flow
1. **Core Domain Logic:** Pure TypeScript modules in `client/src/game/` handle game rules, coordinate spaces, and procedural generation without React dependencies.
2. **Rendering Layer:** Babylon.js orchestrates meshes, materials (`disableLighting = true`), and animated billboard sprites.
3. **UI State Management:** React components communicate with the game runtime via event buses and custom hooks (`useGameBridge`), driving the HUD exclusively through event subscriptions rather than per-frame polling.
4. **Backend Persistence:** tRPC routers securely handle save/load operations, player inventory persistence, and LLM-backed AI narrative generation.

## Domain Model and Trust Boundaries

The runtime is a deterministic simulation core surrounded by rendering and UI adapters. React must never mutate world state directly; UI components submit typed player intents to the game scene. Babylon renders read-only snapshots from the simulation. The backend persists validated save snapshots and executes approved AI narrative requests, while the LLM may create descriptive text only and cannot issue game commands, award items, alter faction power, or change a save.

| Domain aggregate | Primary entities | Invariants |
|---|---|---|
| `WorldState` | `WorldSeed`, `RegionState`, `WeatherState`, `SeasonState`, `DiscoveryState` | Seeded generation is repeatable; generated chunks never mutate canonical quest landmarks. |
| `SettlementState` | `Settlement`, `BuildingInstance`, `PopulationGroup`, `Storage`, `InfrastructureEdge` | Buildings consume validated resources, require a valid footprint, and emit an explainable upkeep/ecology effect. |
| `EconomyState` | `ResourceStack`, `MarketSnapshot`, `TradeRoute`, `TradeOffer` | No negative inventory; every transfer is ledgered; price changes are derived from visible factors. |
| `FactionState` | `Faction`, `Relation`, `Treaty`, `CouncilDecision`, `Law` | Relationship changes record a source event, a magnitude, and an expiration/review time where applicable. |
| `ActorState` | `Player`, `Npc`, `Goal`, `Blackboard`, `BehaviorTreeState` | Actors may only act on observed or legally shared information; blackboards are typed and branch reevaluation is event-driven. |
| `QuestState` | `QuestDefinition`, `QuestInstance`, `WorldGate`, `Reward` | Every critical path is validated for key/ability order; no quest can require a gate it alone unlocks behind itself. |
| `CulturalReviewState` | `ReferenceRecord`, `ReviewGate`, `ConsentRecord`, `AttributionRecord` | No real community-derived asset enters a release candidate without provenance, permitted use, and reviewer decision. |

## Feature Ownership

```
client/src/game/features/
  building/        definition.ts, placement.service.ts, upkeep.service.ts, building.test.ts
  economy/         economy.types.ts, market.service.ts, trade.repository.ts, economy.test.ts
  factions/        faction.types.ts, relation.service.ts, council.service.ts, faction.test.ts
  survival/        survival.types.ts, harvesting.service.ts, weather.service.ts, survival.test.ts
  quests/          quest.schema.ts, gate-validator.ts, quest.service.ts, quest.test.ts
  spirits/         ability.schema.ts, spirit.service.ts, ritual-state.ts, spirits.test.ts
  ai/              blackboard.ts, behavior-tree.ts, perception.service.ts, ai.test.ts
```

## AI Architecture (Behavior Tree, Engine-Agnostic)

NPC logic adopts the priority and observability discipline of behavior trees while remaining portable TypeScript. Each NPC owns a typed blackboard. A `Selector` chooses the highest-priority viable goal, a `Sequence` executes a necessary ordered plan, decorators validate predicates such as safety, role access, and relationship trust, and services refresh sensed world facts at simulation-tick intervals. Long-running tasks must either return success/failure or register a completion event, preventing hung behavior branches. This replaces per-frame “smart NPC” prompting with predictable, testable decision logic.

## UI Architecture

The HUD is event-driven, not polled. The scene publishes `HudSnapshot`, `SettlementSnapshot`, `QuestSnapshot`, and `DialogueSnapshot` events; React view models subscribe through `useGameBridge`. Screens are a stack—title, play, pause, map, settlement, inventory, journal, and settings—rather than a collection of Boolean flags. Layout uses anchored containers, a 1920×1080 design reference with an expand policy, safe-area insets, visible focus states, and an initial gamepad/keyboard focus target per screen. The building planner has a mobile-friendly lower sheet, while wide screens render the same data as a left-aligned inspector without duplicating business rules.

## Persistence and Auditability

Save data uses normalized, versioned records plus a validated JSON state payload. A `SaveState` stores the deterministic world seed, player location and inventory, completed gates, region discoveries, settlement graph, trade/faction ledger cursor, quest instances, and version metadata. Migrations are forward-only. All impactful player actions—building, trade settlement, council decision, treaty, and criminal consequence—record an audit entry that enables an explanation panel and deterministic replay in tests.
