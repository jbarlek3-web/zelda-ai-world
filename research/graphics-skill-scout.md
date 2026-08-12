# Graphics Skill Scout — Aurastria

This note records verified repository reviews conducted on 2026-08-12. It is an advisory inventory, not an imported dependency.

| Candidate | Source | Confirmed focus | Aurastria fit |
|---|---|---|---|
| Babylonjs-Skill | https://github.com/Curiosity-Ai-BV/Babylonjs-Skill | Babylon.js 8 patterns for cameras, lighting, shadows, meshes, instancing, PBR/standard materials, textures, node/shader materials, animations, asset loading, performance, and deep-path imports. | Highest priority. It directly matches the installed Babylon.js runtime and would improve materials, shadows, water, low-poly vegetation, post-processing decisions, and performance discipline. |
| Threejs-Awesome-Graphics-Agent-Skills | https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills | Mesh design, lighting, PBR materials, textures, shaders, WebGPU/GLSL, post-processing, stylization, particles, procedural visuals, color management, and tone mapping. | High-value reference, but concepts must be ported rather than copied because Aurastria uses Babylon.js, not Three.js. Best for stylization, water/particle ideas, palette control, and frame-budget guardrails. |
| Babylon.js Engine skill | https://github.com/freshtechbro/claudedesignskills/tree/main/.claude/skills/babylonjs-engine | A broad Babylon.js engine reference covering initialization, cameras, lighting, meshes, PBR/standard materials, shadow mapping, collisions, assets, physics, and scene optimization. | Useful backup reference. It overlaps substantially with Babylonjs-Skill, so it is not recommended as a second import unless a more beginner-oriented monolithic reference is preferred. |
| Awesome GameDev Agent Skills | https://github.com/gamedev-skills/awesome-gamedev-agent-skills | Cross-engine `create-game-assets` pipeline for cohesive sprites, tiles, textures, icons, UI art, and 3D assets, plus engine-agnostic `shader-programming` guidance. | High priority for the current art pass. Import `create-game-assets` now; defer `shader-programming` until a specific water, spirit-particle, or post-process requirement is accepted. |

## Recommendation

Import the Babylonjs-Skill first, then `create-game-assets` from Awesome GameDev Agent Skills. Keep the Three.js graphics pack as a secondary conceptual reference only. Do not add unrelated engine skills or a shader-specific skill until the art pass identifies a concrete missing feature such as water animation, shoreline foam, spirit particles, or a low-poly atmospheric post-process.
