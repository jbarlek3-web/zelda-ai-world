# ASSETS.md — Aurastria Visual and Audio Asset Bible

## Core Asset Catalog

| Asset Name | Description | Key Components |
|---|---|---|
| `tiles_overworld` | Opaque terrain atlas (4x2 cells) | Grass, Forest, Shallow Water, Sand, Rock, Path, Deep Water, Moss |
| `player_sheet_rgba` | Pre-keyed player sprite sheet | Idle, Walk, Attack, Roll, Damage (Down/Up/Left/Right) |
| `items_sheet_rgba` | Pre-keyed item icons | Heart Containers, Keys, Bombs, Bow, Arrows, Rupees |
| `skulltula_sheet_rgba` | Enemy: Skulltula | Patrol, Attack, Hit, Death |
| `moblin_sheet_rgba` | Enemy: Moblin | Patrol, Chase, Strike, Death |
| `boss_sheet_rgba` | Regional Boss | Unique attack patterns, vulnerability states |
| `npc_sheet_rgba` | Tribal NPCs | Merchants, Rulers, Shamans, Warriors |

## Generated Aurastria Visual Assets

| Asset | Web asset URL | Intended use |
|---|---|---|
| Great River Spine visual target | `/manus-storage/aurastria-great-river-spine-reference_ae718f24.png` | Primary painterly lighting, material, and settlement-composition reference for the vertical slice. |
| River wanderer token | `/manus-storage/aurastria-river-wanderer-token_679fb640.png` | Future character/HUD and accessible map-marker reference. |
| Aurastria UI insignia | `/manus-storage/aurastria-ui-insignia_796d052c.png` | Original menu ornament; no real-world cultural symbols or motifs. |
| Riverbank motif | `/manus-storage/aurastria-riverbank-motif_6173947e.png` | Decorative UI/region-card environmental detail. |
| Great River Spine mobile terrain plate | `/manus-storage/aurastria-great-river-mobile-plate_e54226c6.png` | Continuous 4:3 illustrated ground surface that replaces visible prototype grid tiles in the mobile scene. |
| Tidewalker token | `/manus-storage/aurastria-tidewalker-token_62d240e1.png` | Future player-map token and character-marker art; fictional river-scout design. |
| Founding Camp marker | `/manus-storage/aurastria-founding-camp-marker_c7a362ba.png` | Compact settlement landmark art for map and in-world camp treatment. |
| Tideglass Beacon sprite | `/manus-storage/aurastria-tideglass-beacon-sprite_2655aa3a.png` | Focal objective landmark art for the Great River Spine. |
| Mobile map-asset style reference | `/manus-storage/aurastria-mobile-map-asset-style-reference_7be83773.png` | Original limited-palette top-down expedition token direction for the mobile PWA. |
| Tidewalker top-down token | `/manus-storage/aurastria-tidewalker-topdown-token_7e07a69d.png` | Replacement player-map token, generated for direct overhead readability. |
| Founding Camp top-down marker | `/manus-storage/aurastria-founding-camp-topdown-marker_7b81fbfb.png` | Replacement compact camp landmark for the Great River Spine map. |
| Tideglass top-down beacon | `/manus-storage/aurastria-tideglass-topdown-beacon_7ba6abb8.png` | Replacement objective landmark token for phone-scale navigation. |
| River reed top-down token | `/manus-storage/aurastria-river-reed-topdown-token_e3a0da75.png` | Replacement gathered-material token for touch-first identification. |
| Smooth stone top-down token | `/manus-storage/aurastria-smooth-stone-topdown-token_4da7b272.png` | Replacement gathered-material token for touch-first identification. |

The generation service initially supplies live placeholders at these URLs while rendering completes. The implementation must reference the URLs exactly as shown and must not copy the generated image files into the project tree.

**Runtime safeguard:** Active play currently keeps procedural low-poly fallback meshes visible while generated token URLs render as placeholders or lack usable alpha. A generated asset may only replace its fallback after a visual check confirms a transparent, phone-readable result; the fallback avoids black or opaque blocks in the playable map.

## Asset Processing Pipeline
1. **Generation:** Use Manus `generate` mode to produce stylized pixel-art sheets on solid magenta backgrounds.
2. **Chroma-Keying:** Apply tight magenta-only transparency rules via offline scripts to produce `*_rgba.png` versions.
3. **Babylon Integration:** Upload to `/manus-storage/` and reference URLs directly in texture loading logic with nearest-neighbor sampling.

## Art Direction Derived from the Supplied System Sheets

The supplied images establish a clear reference for the settlement and systems layer: deep evergreen or blue-green frames, parchment fields, aged-gold ornament, large high-contrast serif headings, illustrated resource tokens, and readable modular panels. In-game UI should echo this through **original fictional iconography**, warm parchment cards, leaf-green category headers, and gold focus highlights. It must not copy visual motifs, totems, or designs associated with a real people. This is a visual grammar, not a cultural asset library.

| Asset family | Required direction | Prohibited direction |
|---|---|---|
| Regions | Painterly, wide environmental views; strong weather, water, landform, and settlement silhouettes; original architecture. | Direct copies of real sacred locations, archaeological sites presented as “ruins to loot,” or labels naming living peoples without permission. |
| Characters | Distinct fictional wardrobe, material culture, occupations, ages, and body types; portraits center agency and role. | Pan-Indigenous dress, generic headdresses, “noble savage” imagery, or stereotyped shaman/warrior roles. |
| Buildings | Material and climate-driven forms; readable construction stages and resources; original decorative motifs. | One architecture kit applied across all regions or copied community-specific designs. |
| Spirit realm | Abstract landscapes of memory, weather, light, animal movement, water, and season. | Replicas of real ceremonies, masks, sacred sites, songs, or language. |
| UI iconography | Geometric, botanical, astronomical, and topographic forms drawn for Aurastria. | Real clan symbols, sacred patterns, or copied Indigenous graphic language. |

## Prompting Contract

All generated-art prompts must identify the **fictional region**, the **environmental relationship**, the **gameplay readability requirement**, the **camera/composition**, and a **negative prompt**. Prompts must avoid “Native American,” “tribal,” named nation/people, “shaman,” “totem,” or real ceremonial terminology as style shortcuts. The following is the template for the art-prompt library.

```text
[Asset type] for Aurastria, [fictional region]. [Subject] made from [locally plausible materials],
showing [gameplay function] and [environmental relationship]. [Mood/weather/time of day].
Painterly action-adventure concept art, original fictional design language, readable silhouette,
material detail, respectful non-derivative worldbuilding, no text, no real-world Indigenous symbols,
no recognizable sacred sites, no modern technology, no firearms.
```

## Initial Region Prompt Seeds

| Region | Prompt seed |
|---|---|
| Frozen Dawn Tundra | “A riverside winter settlement under an aurora, low insulated timber-and-earth homes, community sled store, migrating herd distant across blue snow, wind-carved ice cliffs, warm firelight, painterly action-adventure concept art, original fictional design language, no text, no real-world cultural symbols.” |
| Sky-Cutter Mountains | “High mountain pass with a rope bridge, spring-fed terrace, wind shrine of original geometric stonework, climbers in layered practical travel clothing, clouds below a sharp ridge, painterly action-adventure concept art, clear traversal landmarks, no text, no real-world cultural symbols.” |
| Verdant Spiritwood | “Wet forest settlement built around a raised boardwalk and rain-garden, giant mossy trees, canopy lanterns, guardian-beings suggested through drifting leaves rather than figures, rich green palette, painterly action-adventure concept art, no text, no real-world cultural symbols.” |
| Great River Spine | “Vibrant river market at a confluence, canoe docks, granary, workshop, braided river channels, seasonal flood markers, regional trade goods arranged in readable stalls, painterly action-adventure concept art, no text, no real-world cultural symbols.” |
| Jaguar-Veil Rainforest | “Rainforest waterfall and vine-covered fictional observatory, canopy bridges, colorful birds, mist, stone water channels, explorer framing that respects rather than loots the site, emerald palette, painterly action-adventure concept art, no text, no real-world cultural symbols.” |
| Painted Desert Wastes | “Desert caravan at a shaded canyon spring, ceramic water vessels of original abstract design, sunlit mesas, woven shade shelters, distant salt flats, navigational star markers, painterly action-adventure concept art, no text, no real-world cultural symbols.” |
| Emberback Archipelago | “Black-sand harbor beneath a quiet volcano, outriggers and fishing nets, ash-resistant storehouses, fictional horned megafauna on a distant ridge, amber firelight against ocean mist, painterly action-adventure concept art, no text, no real-world cultural symbols.” |
| Storm-Coast Archipelago | “Stormy sea cave sanctuary with tide pools, resilient coastal harbor, storm-sails on longboats, rain curtains and luminous navigation beacons, powerful waves, painterly action-adventure concept art, no text, no real-world cultural symbols.” |

## Audio Direction

Audio is grounded in environmental texture—wind, ice, insects, rain, rivers, surf, birds, fire, wood, stone, and regional work rhythms—with an original score written in collaboration with appropriately credited musicians. Do not use ceremonial recordings, traditional songs, chants, or instruments as generic atmosphere without explicit licensed permission and cultural approval. Sound design shall follow the `sound-design` skill: dialogue remains primary, music ducks 18–20 dB beneath narration, final web delivery targets approximately -14 LUFS integrated and a -1.5 dBTP ceiling.


## 13. Humanoid Character Upgrade

| Asset | Source / provenance | Runtime use |
|---|---|---|
| `tidewalker-humanoid-runtime` | Original Babylon-native low-poly assembly authored for Aurastria after auditing Blender Models, OpenGameArt, and Quaternius. No unverified third-party files are bundled. | Player explorer: cloak, belt, head, hair cap, arms, legs, river staff, staff gem, ground marker, and heading indicator under one TransformNode. |
| `camp-guide-humanoid-runtime` | Same original runtime builder with a distinct fictional palette and role silhouette. | Camp guide landmark near Founding Camp. |

The current implementation uses the supplied resource sites as sourcing and visual-direction references, but does not redistribute an external model whose item-level license has not been verified. The runtime builder targets low tessellation, shared material behavior, and a mobile-safe mesh budget. A future verified Quaternius or OpenGameArt GLB can replace the builder behind the same character runtime contract.


## 14. External Source Provenance and Shipping Rules

| Source | Candidate use | Verified license / restriction | Status |
|---|---|---|---|
| https://www.blender-models.com/ | Human and character references; candidate Blender models | Mixed item-level terms, including CC BY and CC BY-NC examples; verify the concrete model page before use. | Reference-only in current build |
| https://graphicburger.com/mobile-game-gui/ | Mobile UI visual reference or embedded UI art | GraphicBurger permits commercial use and modification without required attribution, but prohibits standalone resale or redistribution of source files. | Reference-only in current build |
| https://opengameart.org/ | Candidate characters, props, and environment art | License varies by item and author; verify every asset page and attribution requirement. | Reference-only in current build |
| https://quaternius.com/ | Preferred candidate for future humanoid GLB and animation packs | QAL v1.0 permits commercial products, modification, and distribution of completed products without credit; do not redistribute the assets standalone. | Future import candidate; not bundled yet |
| https://www.textureking.com/ | Texture references | Commercial use and modification allowed, but standalone or combined redistribution requires prior written consent; no ownership claim. | Reference-only in current build |

## 15. Mobile Character Asset Budget

| Actor | Geometry target | Material groups | Lighting / animation budget | Current implementation |
|---|---:|---:|---|---|
| Explorer | 1,000–2,000 triangles | 4–6 shared materials | Unlit materials; transform-only locomotion; no per-frame allocations | Original Babylon-native humanoid |
| Camp NPC | 1,000–2,000 triangles | 4–6 shared materials | Unlit materials; static pose; one shared builder | Original Babylon-native humanoid |
| River Wisp | 300–700 triangles | 2–3 materials | Emissive unlit body, one scoped light, one halo | Existing spirit mesh; intentionally non-humanoid |
| Skulltula | 600–1,200 triangles | 3–4 shared materials | Deterministic FSM; pooled or persistent mesh | Domain FSM complete; scene visual integration pending |
| Moblin | 1,200–2,000 triangles | 4–6 shared materials | Deterministic FSM; no dynamic shadow requirement | Domain FSM complete; scene visual integration pending |
| Dungeon boss | 2,000–3,500 triangles | 5–8 shared materials | Scoped emissive accents; phase changes without mesh churn | Domain FSM complete; scene visual integration pending |

All current shipped character geometry is original procedural Babylon geometry, so no unverified external asset is redistributed. The runtime contract is intentionally compatible with a later verified GLB import.


## 16. Great River Spine Silhouette Refinement

The Tideglass beacon now uses an original faceted crystal, a shared emissive aura ring, and three floating shard accents. River-reed and smooth-stone gathering targets now use original emissive ground rings in addition to their existing low-poly bodies. These additions are authored Babylon geometry and do not depend on any external asset license.


## 17. Dungeon Visual Runtime

The first dungeon now renders as a deterministic, cullable Babylon preview/runtime domain. The room shell uses unlit original floor and wall geometry, while the key marker, locked door, treasure chest, and boss landmark use shared gold materials. `dungeonVisuals.ts` provides original procedural low-poly actors for Skulltula, Moblin, and Dungeon Boss; no third-party model archive is bundled. The visuals respond to the existing `FirstDungeonRun` and `DungeonEnemyState` contracts: key pickup hides the key, opening the door hides the threshold, chest opening changes its presentation, defeated actors are disabled, and windup/recover/strike phases alter scale or vertical pose.

The runtime is kept within the mobile budget by using shared unlit materials, low tessellation, persistent meshes, and transform-only phase feedback. The browser preview did not provide a stable active-play capture after Babylon WebGL2 mounted, so the active-play visual screenshot remains an explicit verification limitation rather than a claimed success.
