# Great River Spine Performance Record

**Measurement context:** local WebDev preview, 1280×720 screenshot runtime, Babylon.js development build. This is a development-environment diagnostic, not a release-hardware benchmark.

| Sample | Active meshes | Frame time | Reported FPS | Interpretation |
|---|---:|---:|---:|---|
| Before terrain batching | 563 | 87.4 ms | 12.0 | Per-tile terrain meshes created excessive scene work. |
| After material-batched terrain | 120 | 25.5 ms | 14.0 | Static terrain active-mesh count fell by approximately 79%; visual composition remained intact. |
| Cold/restart sample | 120 | 75.4 ms | 16.7 | Not representative of steady-state performance; startup and screenshot capture affect the development browser. |

The intended target remains **60 FPS / 16.67 ms per frame**. The current capture environment does not meet that target, so this record does **not** claim production performance compliance. The implemented safeguards are shared-material terrain batching, shared foliage/rock mesh instances, six animated water materials instead of 168 independently animated water meshes, and a capped set of 20 ambient motes.

## Next Profiling Requirement

Validate a warmed release-like browser run with a browser profiler capable of separating CPU and GPU cost. Record draw calls, sustained frame time, and resolution/device details before adding more particles, shadows, post-processing, or region-scale foliage.
