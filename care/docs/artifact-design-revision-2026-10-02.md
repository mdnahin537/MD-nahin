# Artifact design revision — 2 October 2026

The customer preferred the earlier copper sculpture and rejected the colour-led aging pass. This revision restores its luminous copper palette and makes historical character readable through relief and workmanship.

## References actually viewed

- [Annotated Nebra sky-disc image](https://github.com/gseilheimer/himmelsscheibe/blob/master/img/himmelsscheibe.png): broad gold disk and crescent, round star inlays, broad arcs and a punched perimeter. The educational repository does not establish photographic provenance.
- [Bronze object catalogue photographs](https://github.com/Nona1960/Atlas-of-Ancient-Jade-and-Bronze-Diagnostics/blob/main/ro-bronze-035.html): deep ornament, worn raised edges and darker recesses. The independent catalogue attributes the vessel to late Shang; that attribution was not independently verified.
- [Fragment image bundled with an Antikythera educational simulation](https://github.com/fivasim/Antikythera-Simulation/blob/master/Antikythera/res/drawable/fragmenta.png), used as a secondary visual reference.

An AI-generated concept explored celestial inlays and broad engraved bands. It is design inspiration, not a website screenshot or an archaeological reconstruction. No reference photograph or generated bitmap is added to public runtime assets.

## Resulting design

The existing faceted shape has substantial raised disk and crescent inlays on its initially visible faces, with restrained repeats on the reverse. Two small star clusters and gently uneven recessed fields complete the vocabulary; most faces keep plain copper. The inlays have actual sidewalls and bevels.

The orbiting hoops now have flattened bands, bevelled edges, six recessed punches and six grouped chased marks each. They remain in the same three meshes with the central sculpture. Stable object-space surface shading gives modest worked-metal roughness and softer highlights. This original celestial artifact combines contemporary motion with ancient-inspired craftsmanship; it does not assert a historical function.

The SVG fallback uses the same large inlays and broad ring details. The warm masthead, page background, motion controls and customer flows are retained.

## Verification and limits

Local checks execute the actual scene with the existing graphics fixture: pause and restored preference, reduced motion, hidden/offscreen suspension, single-loop resume, six fallback cases, context loss and finite geometry all pass. The meshes contain 13,854 vertices and 498,744 bytes of vertex data, within the existing 500 KB budget. Normals remain normalized; the maximum radius is 2.007 within the 2.2 envelope.

Mesh and lighting diagnostic images were inspected using a software renderer derived from the actual mesh buffers and shader calculations. They helped reject flat shading and regular striped grain. They are diagnostic approximations, not browser screenshots. Actual native shader compilation/linking runs in the existing GitHub Actions audit after this push. Browser-rendered appearance and mobile frame rate remain for preview assessment.

The isolated browser preview embeds the actual candidate scene and SVG byte-for-byte, serves sample entries, blocks votes/submissions, omits credentials from public asset requests, and disables API connections. A separate earlier-copper preview provides a direct comparison.

Only decorative public graphics, preview files and these notes/results change. Customer data, authentication, owner protection, database schema, secrets and email delivery code are untouched. No production deployment or customer-record write was performed.

## Automated verification after push

[GitHub Actions](https://github.com/mdnahin537/MD-nahin/actions/runs/36997964840) passed for code commit `2bfe2c9a1db16501517f3899fd34532b392807cc`: 46 Node tests, 9 preservation tests, 8 isolated Worker/D1 checks, 21 recovery checks and 11 read-only live checks. The actual revised vertex and fragment shaders compiled and linked in native GLES. The Worker dry-run build and six stylesheet/six client-script parses passed; dependency advisories were zero. Public workflow artifacts retain the full results. Browser appearance and mobile frame rate remain unverified.
