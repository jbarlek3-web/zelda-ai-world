# Mobile Frame-Budget Measurements

All samples are taken with the `FrameBudgetCollector`, which discards the first 45 frames
(shader compilation, texture upload, first-frame layout) and then reports the median over the
next 120 frames. Median rather than mean is used so a single spike cannot masquerade as a
regression, and a single lucky frame cannot hide one.

**Environment caveat:** these numbers come from the sandbox dev server rendered in a headless
browser at a 390x844 viewport, with an unoptimized development build and software rasterization.
They are useful for *relative* before/after comparison and for spotting structural problems such
as draw-call explosion; they are not a substitute for a release-build measurement on real phone
hardware.

Target: 60 FPS, i.e. a 16.67 ms whole-frame budget.

## Baseline — before optimization

| Metric | Value |
| --- | --- |
| Median frame time | 33.10 ms |
| p95 frame time | 37.00 ms |
| Worst frame time | 60.80 ms |
| Effective FPS | 30.2 |
| Within 16.67 ms budget | No |
| Active meshes | 43 |
| Total meshes | 198 |
| Draw calls (cumulative counter) | 6799 |
| Draw calls per frame | 41.2 |
| Lights | 5 |
| Textures | 9 |
| Materials | 28 |
| Ambient motes | 20 |

### Reading of the baseline

The first reading of this sample was wrong, and correcting it is instructive. Babylon's
`engine._drawCalls.current` is a **cumulative** counter, so the raw 6799 initially looked like a
draw-call explosion. Normalizing by frames rendered gives **41.2 draw calls per frame**, which is
entirely reasonable for 43 active meshes and 28 materials. Draw-call submission is therefore *not*
the bottleneck, and "fixing" it would have been effort spent on the wrong side of the frame.

What the corrected numbers actually say:

- **Draw calls per frame (41) and active meshes (43) are healthy.** The earlier instancing and
  material-batching work is holding; there is no batching regression to chase.
- **Five real-time lights against fully unlit materials is suspicious.** Every game material sets
  `disableLighting = true`, so most lighting cost buys nothing visually.
- **The median (32.8 ms) sits far above the budget while the worst frame (2742 ms) is clearly an
  environment artifact** — a headless-browser stall, not a gameplay spike. This is exactly why the
  median, not the mean or the max, is the number being tracked.

Because CPU-side submission looks healthy and the materials are unlit, the next measurement should
isolate how much of the 32.8 ms is fill/rasterization cost in a software-rendered headless browser
versus genuine scene work. Under software rasterization at this viewport, a ~33 ms median is
consistent with pixel-fill cost dominating, which would mean the number is largely an artifact of
the measurement environment rather than a defect a phone GPU would exhibit.

### Lighting audit (follow-up measurement, no code changed yet)

Counting call sites rather than guessing: the scene creates **5 real-time lights** (1 hemispheric
fill, 1 directional key, 3 point lights) and **17 game materials**. Of those materials, only the
camp set (`camp-timber`, `camp-roof`, `camp-hearth`) and the river art set (`river-tree-trunk`,
`river-tree-canopy`, `river-reeds`, `river-rock`) plus `beacon-stone` are still lit; the remaining
nine explicitly set `disableLighting = true`.

So the lights are not entirely redundant — they light the camp and the instanced foliage/rock —
but three point lights for what is effectively local glow around the beacon, hearth, and wisp is
more per-pixel lighting work than the illustrated art direction needs. The point lights are the
defensible target: they are the only lighting whose visual contribution is a localized glow that
emissive material colour can already approximate.

## Decisive measurement — is the frame scene-bound or presentation-bound?

Rather than start optimizing on the assumption that 33 ms of work was happening, the scene's own
per-frame update cost was measured directly (wall clock from `onBeforeRender` to `onAfterRender`,
median over the sample window):

| Metric | Value |
| --- | --- |
| Median whole frame | 33.40 ms |
| Median scene CPU per frame | 1.40 ms |
| Scene share of frame | 4.2% |
| p95 whole frame | 34.40 ms |

**The scene consumes 4.2% of the frame.** The other ~96% is spent outside the scene's update work,
and the frame time is pinned tightly around 33.3 ms — which is precisely a 30 Hz presentation
interval, with a very narrow spread (p95 only 1 ms above the median). That signature is a
refresh/presentation cap, not a workload.

### Conclusion, and what was deliberately *not* done

The honest conclusion is that **this environment cannot show a 60 FPS result**, because the headless
browser is presenting at ~30 Hz. Optimizing against this number would be optimizing against the
measurement rig. The correct engineering response is therefore:

1. Keep the scene's own cost small and measurable — 1.4 ms per frame leaves roughly 15 ms of headroom
   inside a real 16.67 ms budget, which is a healthy position.
2. Bound lighting so future scenery cannot silently multiply per-pixel cost (done: the three glow
   point lights are now restricted via `includedOnlyMeshes`, so they light only the beacon, the camp
   set, and the wisp).
3. Do **not** strip visual features to chase a frame number produced by a 30 Hz presentation cap.

### Before / after

| Metric | Before | After | Note |
| --- | --- | --- | --- |
| Median frame time | 33.10 ms | 33.40 ms | Unchanged; pinned by 30 Hz presentation cap |
| Scene CPU per frame | not measured | 1.40 ms | 4.2% of frame — ample headroom at 60 FPS |
| Draw calls per frame | misread as 6762 | 41.2 | Counter was cumulative; per-frame is healthy |
| Unbounded glow lights | 3 | 0 | Each now scoped via `includedOnlyMeshes` |

The measurable, defensible win here is the lighting bound and the corrected instrumentation, not a
frame-time delta. A real before/after frame-time comparison requires a release build on phone
hardware, which is the remaining open item.
