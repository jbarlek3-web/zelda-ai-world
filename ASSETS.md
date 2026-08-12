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
