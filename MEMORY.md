# MEMORY.md — Aurastria Architecture Memory

## Key Technical Specifications & Hard Lessons
1. **World Axes Convention:** Geometry lies in the XZ plane where `x = tile col`, `z = tile row`, and `+Y` is elevation/up. Domain logic uses `Vec2 {x, y}` mapping `y` to Babylon `z`. Sprite placement requires `setPosition(x, z, groundY)`.
2. **Babylon Import Pattern:** Always use deep module imports (e.g., `import { Engine } from "@babylonjs/core/Engines/engine"`) to prevent bundle bloating and ensure stable compilation.
3. **Materials & Lighting:** All game materials utilize `disableLighting = true` with white emissive textures to preserve the clean, crisp pixel-art aesthetic without harsh runtime shading artifacts.
4. **Tilemap Winding & Normals:** Top-face triangle winding for custom tile mesh builders must use clockwise orientation (`base, base+1, base+2, base, base+2, base+3`) to prevent back-face culling on flat ground tiles.
5. **UI & Focus Architecture:** Following the `game-ui-ux` skill, screens manage focus explicitly, use container-based layouts (`flex`/`grid`) instead of absolute pixel coordinates, and respect safe areas. HUD state updates are strictly event-driven via signal subscriptions.
6. **Cultural & Historical Authenticity:** Technologies reflect pre-colonial 1500s Indigenous America (Longhouses, Earth Lodges, Granaries, Sweat Lodges, Council Houses, Docks, Workshops, Canals, Terraces, Aqueducts, Palisade walls, and Chinampas). No motorization or anachronistic elements are permitted.

## Canon Decisions (2026-08-12)

| Decision | Rationale | Non-negotiable implementation rule |
|---|---|---|
| Title | Canonical working title is **Aurastria: Spirits of the First Dawn**. | Preserve “Legend of the Americas” only as a legacy codename in archive notes. |
| Cultural approach | Aurastria is fictional, informed by landscapes and systems rather than a claim to represent living Indigenous nations. | Never fabricate real Indigenous language, spirituality, rituals, sacred sites, or cultural symbols; require review and permission for any direct reference. |
| Settlement fantasy | Player success comes from stewardship, reciprocity, and durable alliances. | Empire/conquest cannot be the mechanical optimum. Provide council, trade, and ecological pathways to equivalent endgame success. |
| Macro-regions | Eight authored regions form the first world map: Tundra, Mountains, Spiritwood, River Spine, Rainforest, Desert, Emberback, and Storm-Coast. | Chunk generation may vary terrain but cannot replace regional landmarks, social conflicts, quest gates, or cultural review decisions. |
| Resources | Wood, stone, clay, hides, fibers, metals, crops, fish, and knowledge/obligations are simulation categories. | “Culture” is never a fungible material, collectible, or progress currency. |
| Building set | Longhouse, Earth Lodge, Granary, Sweat Lodge, Council House, Dock, and Workshop anchor the first slice. | Every building definition requires cost, footprint, upkeep, worker capacity, ecological consequence, knowledge prerequisite, and explanation string. |
| NPC intelligence | Use deterministic, inspectable goal/blackboard/behavior-tree logic for decisions. | LLMs generate bounded narration and dialogue only; they cannot own state, give irreversible rewards, or change faction/political outcomes. |
| UI | HUD and menus are responsive, safe-area aware, event driven, and fully focus navigable. | No fixed coordinates, screen-flag soup, or per-frame UI polling. |

## Content Review Workflow

1. Classify a proposed asset or narrative element as **fictional**, **general historical/technical**, or **community-specific cultural material**.
2. For community-specific material, block generation and require provenance, intended-use documentation, permission/consent, compensation/benefit-sharing terms, and an identified review authority.
3. Store approved references in an internal restricted library, never an unvetted prompt cache; add attribution and restrictions to the asset metadata.
4. Run an external cultural review before release-candidate creation and maintain a revision/withdrawal path afterward.

## Known Scope Corrections

- The master prompt mentions horses. They are excluded from the pre-colonial technology baseline; movement design instead uses locally appropriate or fictional species, canoes, longboats, climbing, and spirit traversal.
- The master prompt requests “tribal” systems. Code and player copy should use the specific fictional polity name (`nation`, `council`, `clan`, `settlement`, `confederation`, or `league`) defined for the region rather than generic labels.
- “Spirit animals” is replaced in design language with **guardian beings**, **kin spirits**, or region-specific fictional terms. No real-world cultural claim is implied.
- Natural disasters and justice systems must avoid punishing the player through opaque simulation. Every consequence needs an advance signal, a readable cause, and at least one respectful recovery or repair path.
