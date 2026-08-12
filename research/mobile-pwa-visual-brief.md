# Mobile-First PWA and Graphics Rebuild Brief

## Root Cause of the Current Visual Failure

The existing scene visibly exposes implementation primitives: box-per-tile terrain, a cylinder player token, repeated cone-like trees, and desktop HUD cards. Even with improved fog and color, that combination reads as a system test rather than an authored game world. The corrective action is structural: move visible terrain identity into a continuous art-directed surface, reduce UI footprint, and make interaction controls part of the phone composition.

## Chosen Rendering Direction

The first mobile region will use an original **painted-relief terrain plate** below low-poly interactive landmarks. A terrain art texture supplies shoreline, riverbed, path, and vegetation variation; a deliberately small layer of 3D props supplies depth and interaction affordances. The Tideglass Beacon remains a 3D focal object. This approach removes the visible grid, retains deterministic world coordinates for gameplay, and bounds render cost on a phone.

## PWA Delivery Contract

The app shell will include a web manifest, maskable icons, a same-origin service worker, and a network-first navigation fallback to the cached shell. The gameplay bundle remains online-first for fresh content, but returning players can reopen the interface and retained shell offline. Save requests must surface a clear archive-unavailable state instead of silently failing.

## Mobile Interaction Contract

Touch controls use a left-thumb movement pad and right-thumb actions for interact, gather, and pause. They are optional on pointer-precise desktop screens, accessible by `aria-label`, and visibly bounded by the safe-area. Keyboard and gamepad mappings remain unchanged.
