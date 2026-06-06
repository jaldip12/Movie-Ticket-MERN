# PWA Icons

Drop the following two PNGs into this folder so the web app manifest can pick
them up at runtime:

- `icon-192.png` — 192×192 PNG
- `icon-512.png` — 512×512 PNG

## Recommended look

- **Background**: solid dark navy `#0b0f19` (matches the site theme).
- **Foreground**: red Film glyph (Lucide `Film`, color `#dc2626`) centered on the
  canvas.
- **Maskable safe area**: leave roughly **10% padding** on every side so Android
  can crop the icon into a circle/squircle without clipping the glyph. The
  manifest declares `"purpose": "any maskable"`.
- Square (1:1) PNGs only — no transparency required (background_color in the
  manifest will fill any gaps anyway, but solid is cleaner).

Once both files are present, "Add to Home Screen" on Android/iOS, plus the
desktop install prompt wired up by `InstallPrompt.jsx`, will use them.
