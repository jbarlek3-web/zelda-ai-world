# Free Game-Dev Art Source Audit

**Date:** September 5, 2026  
**Project:** Aurastria: Spirits of the First Dawn

## Findings

| Source | Relevant discovery | Current decision |
|---|---|---|
| [Blender Models](https://www.blender-models.com/) | The site exposes Characters/Humans categories and individual model pages with license labels. The homepage currently lists examples under Attribution CC BY, but individual asset terms must be checked before use. | Research source only until a specific model page is verified and downloaded under a compatible license. |
| [GraphicBurger Mobile Game GUI](https://graphicburger.com/mobile-game-gui/) | A colorful vector/PSD mobile UI kit is available as a 5.2 MB layered PSD with vector shapes. | Useful as visual reference for UI hierarchy, but not a direct Babylon character source; licensing must be confirmed from the linked license page before shipping derived UI art. |
| [OpenGameArt](https://opengameart.org/) | The site hosts user-submitted assets and exposes item-level licensing. Search results include a “Rigged Low-Poly female character” and “Base Human Models (Low Poly) for Blender 2.5x.” | Candidate source for specific characters only after item-level license, author, file format, and redistribution rights are recorded. |
| [Quaternius](https://quaternius.com/) | The catalog includes Universal Base Characters, Modular Character Outfits, Universal Animation Libraries, Bestiary/Dungeon Monsters, and nature/environment kits, with rigged/retargetable labels. | Strongest candidate for a low-poly humanoid pipeline. Use only a specific downloaded pack after checking its license page and formats. |
| [TextureKing](https://www.textureking.com/) | The site offers free stock textures across stone, wood, dirt/sand, liquids, glass, and other categories and links to Terms of Use. | Suitable for selective environmental material references only after Terms of Use review; avoid adding unverified texture downloads to the build. |

## Verified License Terms

| Source | Verified terms | Shipping decision |
|---|---|---|
| [GraphicBurger License](https://graphicburger.com/license/) | Personal and commercial use is permitted; modification and inclusion in applications are permitted; attribution is not required; standalone resale, sublicensing, or redistribution of the files is prohibited. | The Mobile Game GUI may inform or be embedded into the game only as part of the application, not redistributed as a standalone PSD/asset pack. It remains reference-only until its PSD is intentionally downloaded and converted into shipped UI assets. |
| [Quaternius Asset License v1.0](https://quaternius.com/license.html) | Commercial use, modification, and distribution of a completed product are permitted without credit; standalone resale or redistribution of the assets is prohibited. | Quaternius is the preferred future GLB source. A specific pack may be imported after download provenance is recorded; the current build remains original procedural geometry. |
| [TextureKing Terms](https://www.textureking.com/terms/) | Commercial use and modification are permitted, but the textures may not be redistributed standalone or combined into another product without prior written consent; ownership remains with TextureKing. | Do not bundle TextureKing textures into the current web build without written permission. Keep the source reference-only and use original/generated materials for shipped assets. |
| [OpenGameArt](https://opengameart.org/) | Licensing is asset- and author-specific. The site hosts multiple licenses, so the item page must be verified for every candidate. | Reference/candidate source only until a concrete item license and attribution record are captured. |
| [Blender Models](https://www.blender-models.com/) | Homepage examples expose mixed item-level licenses, including CC BY and CC BY-NC. | Reference/candidate source only until a concrete item license and attribution record are captured. |

## Production Constraints

Aurastria must remain a fictional world with original visual language. Character silhouettes may be humanoid, but wardrobe, materials, colors, and accessories must not reproduce real-world Indigenous symbols, ceremonial dress, named peoples, sacred sites, or cultural motifs. Because the provided sources are mixed-license user repositories, no third-party asset should enter the shipped build without item-level provenance and redistribution verification.

The safest first implementation is a Babylon-native stylized humanoid assembled from low-poly primitives with shared materials and a single coherent silhouette. This removes loader and attribution risk while allowing later replacement by a verified GLB from Quaternius or OpenGameArt. The mesh budget should target one visible explorer at approximately 1,000–2,000 triangles, no more than 6–8 material groups, and no additional per-frame allocations. Encounter actors should use the same silhouette language with differentiated proportions, palette, and emissive accents.

## References

[1]: https://www.blender-models.com/ "Blender 3D Models"
[2]: https://graphicburger.com/mobile-game-gui/ "GraphicBurger Mobile Game GUI"
[3]: https://opengameart.org/ "OpenGameArt.org"
[4]: https://quaternius.com/ "Quaternius Free Game Assets"
[5]: https://www.textureking.com/ "TextureKing Free Textures"
[6]: https://www.textureking.com/terms/ "TextureKing Terms of Use"
[7]: https://graphicburger.com/license/ "GraphicBurger License"


## Implementation Status

The current pass replaces the player’s flat cylinder/core/chevron stack with an original Babylon-native `TransformNode` humanoid composed of low-tessellation torso, head, hair cap, arms, legs, belt, river staff, staff gem, ground marker, and heading indicator. A second palette variant is placed beside Founding Camp as a fictional humanoid guide landmark. The legacy illustrated player token remains disabled as a safe fallback/reference and is still synchronized for future map-marker use.

The river wisp remains deliberately non-humanoid because it is a spirit encounter and its abstract emissive silhouette is part of the established visual direction. Skulltula, Moblin, and boss visuals remain a separate scene-integration task; their deterministic domain state machines are already covered by tests. The current pass therefore does not claim those encounter visuals are complete.
