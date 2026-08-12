# Aurastria Video Reference — Visual Motion Specification

The supplied video is treated only as a **cinematic reference**, not as an asset source. Its original labels, symbols, architectural forms, and identifiable creative details must not be reproduced. The implementation target is an original Aurastria environment that adopts high-level composition principles only.

| Reference principle | Original Aurastria interpretation | Browser implementation boundary |
|---|---|---|
| Static establishing composition | Use stable three-quarter regional views and a player-follow camera with gentle damping. The environment—not rapid camera cuts—carries the mood. | No prerecorded footage is required; camera movement remains real-time and player-controlled. |
| Organic reclamation of old places | Depict fictional weathered infrastructure, river stone, roots, reeds, moss, and non-specific luminous mineral growth. Avoid replicas of real sites or recognizable architecture. | Layer instanced foliage, rocks, and simple moss/decal meshes rather than high-poly set dressing. |
| Atmospheric depth | Use tiered foreground, middle-distance, and skyline layers. Fog should conceal low-detail distance and direct attention to landmarks. | Start with `Scene.FOGMODE_EXP2`; tune density per region and retain a frame-time budget for mobile browsers. |
| Quiet localized motion | Keep a calm world alive through low-amplitude water movement, swaying vegetation, drifting mist, and occasional ambient particles. | Prefer material time offsets and a small capped particle pool. Avoid full-screen effects unless GPU profiling confirms safe headroom. |
| Warm/cool light contrast | Pair restrained golden dawn/sunset illumination with original cool cyan, teal, violet, or ember emissive points according to the fictional biome. | Use emissive materials and a small number of local lights; reserve glow/post-processing for selected landmarks only. |
| Guided focal hierarchy | Rivers, trails, and contrast lighting should lead from a nearby shelter or resource node toward a regional landmark. | Make traversal routes readable from the gameplay camera; do not depend on cinematic-only framing. |

## Acceptance Criteria

The Great River Spine first pass must gain discernible depth through fog, a warm directional-light cue, material variation, and a single readable landmark path. The resulting scene should remain navigable at the existing camera distance, should keep the world names and symbols original, and must be verified through WebDev screenshots before any advanced post-process is retained.

## Additional Motion Principles from the Approved Video Set

The newer references reinforce a visual hierarchy built from **quiet terrain, localized energy, and slow intentional camera movement**. For Aurastria this becomes an original zone-language, not a copy of any supplied fantasy geography.

| Principle | Aurastria rule | Initial implementation decision |
|---|---|---|
| Zone color has meaning | Each fictional region receives one controlled atmospheric accent: river cyan, ember orange, storm violet, or deep-growth teal. Neutral land remains visually quiet between accents. | Apply the Great River Spine’s restrained teal-cyan only to water and a single landmark; retain olive/earth base terrain. |
| Motion announces importance | The highest-motion, highest-emission effects are reserved for optional landmarks and player proximity moments. Ordinary terrain uses very slow loops. | Begin with a calm river UV drift and a slow beacon pulse. Defer vortices, lightning, and bloom until screenshots and frame time justify them. |
| Air separates scale layers | Haze should increase toward the horizon and around a region’s far landmark, improving distance perception without rendering distant detail. | Combine EXP2 fog with a small number of large soft haze sprites; avoid full volumetric rendering. |
| Luminance directs the player | Brightness should form a path from safe camp to an exploration objective; it must never hide navigation markers or HUD text. | Use a warm camp lantern and a cool river beacon as separate, low-range focal points. |
| Camera is a support system | Any target-driven camera emphasis must remain optional and motion-sickness-safe. Player input is never overridden during exploration. | Keep the existing player-follow camera. Limit ambient camera drift to non-interactive atlas/menu views only. |

## First-Pass Effect Budget

The Great River Spine visual upgrade is capped at one directional light, one hemispheric fill light, no more than two local point lights, one modest fog mode, one time-based water material offset, one landmark emissive pulse, and particle counts measured in dozens rather than thousands. Higher-cost effects require a demonstrated visual benefit and a fresh browser performance check.
