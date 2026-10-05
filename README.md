# Hush Café

A static, bilingual one-page site for Hush Café in Alexandria. No build step, no backend, no cart.

## Local preview

JSON files are loaded with `fetch`, so open the folder through a local server (not `file://`).

```bash
node preview.js
```

Then visit http://127.0.0.1:5173

## Edit the menu

1. Open `data/menu.json`.
2. Each category has an `id` that must match a key in `data/translations.json` → `en.cats` / `ar.cats`.
3. Item fields:
   - `en` / `ar` — names
   - `price` — single price
   - `priceS` / `priceM` — small / medium
   - `priceHot` / `priceIced` — hot / iced
   - optional `descEn` / `descAr`
4. Refresh the page. Do not invent prices; copy them from the printed menu.

## Replace photos

Put WebP files in `images/`:

| File | Used as |
| --- | --- |
| `drinks.webp` | Hero + gallery |
| `tray.webp` | About + gallery |
| `takeaway.webp` | Gallery |
| `croissants.webp` | Gallery |
| `logo.webp` | Navbar |
| `favicon.png` / `apple-touch.png` | Icons |

Keep filenames the same, or update `index.html` and `js/app.js` (`GALLERY`). Compress to WebP before uploading.

## Languages

The site defaults to Arabic if the browser language starts with `ar`, otherwise English. The AR / EN control saves the choice in `localStorage` (`hush-lang`). All user-facing copy lives in `data/translations.json`.

## Hours, phone, branches

Edit `data/config.json`:

- `openingHours.en` / `openingHours.ar` — the placeholder shown on location cards
- `openingHours.schemaHours` — Schema.org strings (e.g. `"Mo-Su 08:00-00:00"`) once you know the hours
- `phone`, `phoneIntl`, `whatsapp`, `instagram`
- `branches` — address text and `mapQuery` used for embeds and directions

## Deploy

Upload the project root. Ignore `tools/` if present.

- **Netlify / Vercel:** drag the folder, or connect the Git repo. Publish directory is the project root. No build command.
- **GitHub Pages:** set Pages to deploy from `/` (root) on the main branch.

## TODOs for the owner

- Fill real **opening hours** in `data/config.json`.
- Confirm spellings kept as on the source menu: *Corto Classic*, *Trafel Cake*, *Matelda Cake*, *Eclair Nuttekka-Kinder*.
- Branch 2 has no Plus Code; the map uses the street address.
- Sandwich English descriptions are translations of the Arabic notes you provided.
