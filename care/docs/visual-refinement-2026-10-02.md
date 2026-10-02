# Customer Care visual refinement — 2 October 2026

The customer requested richer sculpture and ring detail, a warm brown top bar, subtle whole-page texture, and then an ancient appearance with a small modern touch.

The rotating shape now resembles a worn bronze celestial instrument. Broad, deterministic variation follows its surface as it rotates; restrained green patina gathers in seams and recessed channels. Tessellated face panels include narrow chamfers and a few larger engraved borders. Ring marks alternate in length and occupy only a fifth of each marked segment. A polished rim retains the modern touch. The static SVG fallback follows the same bronze palette, patina, sparse scratches and engraving.

The existing warm brown masthead and scratch texture remain in this candidate. Original light and dark page surface colours are preserved. Secondary header text and keyboard focus outlines use dark ink.

This change uses existing native WebGL and static SVG assets. It adds no runtime dependency, remote texture or animated grain. Motion speeds, pause preference, reduced-motion handling, hidden/offscreen suspension, and graphics failure recovery remain unchanged.

## Checks before repository publication

The actual scene module was executed with the existing graphics DOM/WebGL fixture. It uploads three meshes with 13,020 vertices and 468,720 bytes of vertex data, below the 500 KB budget. Coordinates and colours are finite, normals remain normalized, and the sculpture stays within its existing envelope. Repeated initialization produces identical surface data. Vertex and fragment shader sources are byte-for-byte unchanged from the previously validated native GLES program; native compilation was not rerun in the local fixture pass.

Pause, reduced motion, hidden/offscreen suspension, single-loop resume, six initialization/fallback failure cases, and context loss passed. Static SVG references and tag nesting passed. A geometry regression check covers finite values, unit normals, the envelope and the mobile budget.

Selected colour checks from the brown-header pass: dark text against the header 4.65:1; light CTA text against dark brown 10.55:1. These are limited checks, not a complete accessibility assessment.

Browser-rendered appearance remains for the customer to assess in the separate design preview. No screenshot or browser automation was used in this pass. The preview uses sample entries, blocks submissions and votes, omits credentials on public asset requests, and cannot connect to the live API.

Submission, authentication, owner protection, customer records, database schema, secrets and email code are untouched. No production deployment or customer-record write was performed.

## Automated verification after push

[GitHub Actions](https://github.com/mdnahin537/MD-nahin/actions/runs/36994206769) passed for code commit `103d021cb40d5fa8dad569da21b7efda52892a8e`. The audit ran 46 Node tests, 9 preservation tests, 8 isolated Worker/D1 checks, 21 recovery checks and 11 read-only live checks. It compiled and linked the actual graphics shaders in native GLES, built the Worker without deploying, parsed six stylesheets and six client scripts, and reported zero dependency advisories. The workflow's public result artifact is available from the linked run. These checks do not establish browser-rendered appearance or fresh inbox delivery.
