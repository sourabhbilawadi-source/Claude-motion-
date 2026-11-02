# Decoy Report — Motion Style Guide
Source: 6 most recent @decoyreport reels (Nov 2026), analyzed via vidIQ. Format 1080x1920, 30fps, 44–61s.

## Look
- Flat 2.5D vector illustration, 2–3px dark outlines (#111). Light, clean, editorial.
- Light canvas: off-white grid paper #F4F5F0 (grid #E2E5DC, ~40px cells). Flat ambient light.
- Dark "X-RAY" mode: blueprint navy #14223A / #172338, cyan lines #4DE2F8 / #00E5FF with glow 8–12px.
- Accents: alert red #E63946, gold #F2C94C, green #5BC882; one brand color per video (pink cup, purple Nike, In-N-Out red/yellow).
- Saturated hero object, everything else desaturated (<15%).
- Grain 2–5% overlay. No chromatic aberration, no heavy blur.

## Lighting & shadow
- Single overhead spotlight cone on hero object (white/warm, 15–25% opacity, add/screen, feathered).
- Two-layer shadows: contact (y 4px, blur 6px, 40%) + ambient (y 20px, blur 35px, 25%).
- Glass sheen: angled white gradient sweep across glass/screens over 18 frames.
- Neon/HUD elements get additive outer glow.

## Typography
- Hook title top-left: heavy grotesk ("Same machines.") + italic serif second line ("Same price.").
- Footer lockup: "DECOY REPORT" wide-tracked mono under a thin bar.
- Data labels: uppercase mono (JetBrains/Space Mono), tracking +50–100.
- Subtitles: white bold sans in black rounded pill (radius 8), word-by-word synced to VO.

## Motion rules
- Never linear. Slide-ins: cubic-bezier(0.16,1,0.3,1), 12–15f.
- Pops: scale 0→115%→100% in 8–12f (spring damping ~12, stiffness ~180).
- Impacts: squash 115/85 → 92/108 → 100 over ~20f.
- Stamps ("DECOYED", "UNSOLICITED", "SALE"): scale 140–180%→100% in 6–10f, -6° to -12° tilt, screen shake 4px for 2–6f, sub-bass hit.
- Staggers 2–4f per item. Trim-path line draws 12–18f. Number counters easeOutExpo 30–45f.
- Hanging tags/badges: pendulum decay +12°→-8°→+3°→0°.
- Idle: 1–2px float/breathing, subtle push-in 100→103–106% on hold shots.
- Typewriter 1 char / 2 frames.

## Signature transition: X-RAY scan
- Horizontal cyan laser (2px white core + 20px cyan glow) sweeps top→bottom in 10–30f.
- Behind it, the scene flips to dark blueprint wireframe of the same objects. Reverse scan returns to light.
- Used for the "science/study" segment of every video.

## Cuts & pacing
- New visual beat every 1.5–2.5s. ~6 hard cuts + 2 scan wipes + 1 zoom-out per video.
- Match cuts and object-morphs (envelope absorbs object, card splits in two).

## Structure (~50s)
1. 0–3s Hook: hero object + contrast question ("$45 cup vs $15 cup").
2. 3–10s Premise / comparison A vs B.
3. 10–20s X-RAY: named study/researcher, data chart.
4. 20–35s Insight + metaphor visuals.
5. 35–42s "Steal this" / apply to your business.
6. 42–55s CTA: phone mockup, AI prompt typing, comment keyword, DM notification drop, DECOYED stamp.

## Sound
- Lo-fi/electronic bed, sidechained under VO.
- Foley on every move: pops, clicks, paper swish, laser sweep, counter ticks, stamp thud + 808.
