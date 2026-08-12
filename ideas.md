# Aurastria — Mobile-First Visual Direction

The game should read as a **pocket-sized mythic river expedition**, not as a desktop prototype squeezed onto a phone. The Great River Spine is presented through an original illustrated terrain surface: muted deep-jade woodland, jade-to-teal river water, warm ochre paths, weathered stone, and a single turquoise Tideglass landmark. The view favors strong silhouette, soft atmospheric depth, and deliberate negative space over dense micro-detail.

The mobile HUD is a compact expedition instrument. It uses one slim status strip, a low-contrast compass/minimap cue, a thumb-reachable action cluster, and short labels. The game canvas is never obscured by large floating cards during active play. Title, pause, and save screens use parchment-gold on deep evergreen, but do not imitate the supplied reference-map labels or symbols.

## Acceptance Criteria

- At 375×812, the playable world retains at least 55% of the viewport after touch controls and HUD are present.
- Movement, interact, gather, and pause controls are reachable by either thumb, maintain 44px minimum target size, and honor safe-area insets.
- The visible terrain cannot depend on a repeating square-grid presentation; the river must have a continuous illustrated shoreline and a readable trail through the scene.
- Static terrain is drawn as a small number of batched meshes or textures. Decorative effects are capped and disabled for reduced-motion preferences.
- Title and pause screens remain legible at 390×844 without horizontal scrolling or clipped controls.
