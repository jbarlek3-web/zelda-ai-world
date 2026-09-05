# PWA Browser Verification

## 2026-09-05 managed dev preview

Playwright loaded the active preview at `/?` and evaluated the page before and after forcing the browser offline. The document exposed `navigator.serviceWorker`, but reported zero registrations and no `link[rel=manifest]` in the dev HTML. After `page.context().setOffline(true)` and reload, the Aurastria app shell remained visible with the title and founding objective text.

This is useful offline-shell evidence for the current preview process, but it does not prove native installability because the dev server did not expose a manifest link or active registration. Production/published-domain verification remains required.

## 2026-09-05 published-domain attempt

The published domain loaded without console errors. The first combined verification script then failed at `page.reload()` with Firefox `NS_ERROR_OFFLINE` after toggling offline; the script did not return metadata, so this attempt is not counted as proof of published-domain offline reload. A separate online metadata check and a controlled offline navigation/reload retry are required.

## Published-domain metadata verification — 2026-09-05

The published domain exposed `/manifest.webmanifest`, reported service-worker support, and had one active service-worker registration. The browser did not expose `onbeforeinstallprompt` in this Firefox session, so native install prompting is browser-dependent; the app's fallback guidance remains the applicable path here.

## Published-domain offline reload result — 2026-09-05

The published page had one active, controlling service worker before the test (`registrations: 1`, `controller: true`) and the online app shell was visible. After network emulation was disabled and the page reloaded with the worker ready, the browser returned the document title but an empty body (`shellVisible: false`). Therefore actual offline reload is **not verified** and should remain an open release issue; the generated artifact and registration checks are not sufficient.

A second published-domain attempt waited for `navigator.serviceWorker.ready` and retried after a fresh online navigation. The page still had one controlling service worker and a visible online shell, but the offline reload returned an empty body. This confirms the service-worker cache path is not currently delivering a usable offline app shell in the tested Firefox profile; the PWA item remains open for a code fix or release-host verification.

A delayed retry succeeded: after waiting 2 seconds following the offline reload, the published domain returned the Aurastria app shell with the title and founding objective visible, with no reload error. This confirms offline app-shell reload under the tested Firefox service-worker profile. Native install prompt support remained unavailable in Firefox (`onbeforeinstallprompt: false`), so the fallback install guidance remains the verified cross-browser path; native prompt behavior requires Chromium/device verification.
