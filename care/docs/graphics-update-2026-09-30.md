# Customer Care graphics update — 30 September 2026

The public board now pairs clear bug/idea entry points with a lit copper sculpture, two 3D astrolabe rings, and a quiet layered motion wall. The report and item pages share the material palette and self-hosted typography while keeping their existing working flows.

This follows the [Customer Care audit](customer-care-audit-2026-09-30.md). The handoff and recovery ZIP remain unchanged. The graphics pass changes public presentation and its checks; it adds no database migration, authentication change, production runtime dependency, remote font, or external graphics service.

## Design and behavior

- A native WebGL module generates a faceted copper solid and two smooth torus rings. Directional light, specular highlights, rim light, perspective, and real depth give the sculpture its form.
- Three slow contour layers create the ambient wall. Their transforms move without animating the report controls or board rows.
- An original local SVG remains visible until the first graphics frame succeeds. Missing WebGL, shader/link failures, buffer allocation failures, first-frame errors, and context loss retain or restore the artwork.
- A keyboard-accessible pause button stops the sculpture and wall together. The browser remembers only the decorative motion preference, independently of identity, drafts, and customer records.
- Reduced-motion preferences keep a static scene. Hidden tabs and offscreen scenes stop their animation loop. Returning resumes one loop without a large time jump.
- Rendering is capped in code at 30 frames per second, device pixel ratio 1.5, and canvas width 960 pixels. Geometry is uploaded once. These are implementation limits, not measured device performance.
- The artwork has reserved dimensions. Mobile layouts stack the copy and art, with room for the pause control. Decorative elements are hidden from assistive technology; the heading and actions remain ordinary readable HTML.

The renderer runs only on the board. Shared styles give the wizard and discussion pages restrained depth and consistent borders; they do not add a renderer there. Existing self-hosted fonts are preloaded. Core report, comment, vote, owner, and email modules are unchanged by this pass.

## Verified results

Tested source: `9e4c173b13c9b261a2b6e486a1f3cd964aa542e6`. The pull-request check used GitHub's merge checkout `3eccf16285fb49228b4110262a75427da7652226`.

[Successful workflow](https://github.com/mdnahin537/MD-nahin/actions/runs/36736726354) · [Downloadable results](https://github.com/mdnahin537/MD-nahin/actions/runs/36736726354/artifacts/11107203064) · [Committed results](graphics-results-2026-09-30.json)

| Check | Passed | Scope |
|---|---:|---|
| Backend regressions | 26 | Actual bundled Worker and isolated SQLite/D1 adapter |
| Customer client regressions | 13 | Production client scripts with a small DOM fixture |
| Graphics checks | 6 | Actual scene module; pause/reload, reduced motion, offscreen/hidden lifecycle, initialization failure, context loss, and native GLSL compile/link |
| Migration and fixture preservation | 9 | Isolated Python/SQLite tests |
| Local Cloudflare runtime | 8 | Worker and temporary D1; dummy identity secrets; mail disabled; new graphic assets served |
| Recovery archive | 21 | Archived source tested separately |
| Public live checks | 11 | Read-only HTTP; no credentials or sessions |

All 45 Node tests ran with zero failures or skips in CI. Worker dry-run build, six stylesheet parses, six client script syntax checks, and dependency audit passed. The dependency audit reported zero advisories at verification time.

The shader check captures the exact vertex/fragment strings from the production module and compiles/links them in a native surfaceless EGL/GLES context. It does not open a browser, render or read pixels, create images, or take screenshots. CI installs the graphics libraries on its disposable runner and enables the native check explicitly. The [README](../README.md#local-development) explains the local opt-in; normal local tests remain usable without these Linux libraries.

The specialist reviewed the integrated scene and identified the first-frame error check and mobile spacing correction. Both are included in the tested source.

## Limits and preservation

No production deployment, customer record write, secret rotation, owner change, or new email sending occurred. Existing owner gates, D1 binding, Brevo integration, live mail/contact settings, and identity secrets are retained. The earlier audit's schema reconciliation requirements still apply before deployment.

Rendered browser/mobile appearance, assistive-technology behavior, and measured Core Web Vitals remain unverified. The available performance skill requires Chrome DevTools tools, which were unavailable; no performance trace or simulated performance score is claimed. Automated lifecycle checks and native shader compilation support the implementation but do not establish its appearance on every device. No screenshots or computer-use automation were used.
