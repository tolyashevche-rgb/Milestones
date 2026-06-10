# Mobile Access Plan

Version: Stage 4 Ukrainian testing
Date: 2026-05-05

## Decision

For the first validation round with Ukrainian-speaking parents, use the Ukrainian prototype as the main testing artifact:

- `prototype_stage4_ua/index.html`

Keep the English prototype as the EU/US reference:

- `prototype_stage4/index.html`

## Language Strategy

Recommended path:

1. Ukrainian-first for first parent interviews.
2. English kept as product-market reference.
3. Later bilingual switch inside one product.
4. For Europe/Luxembourg later: EN + FR + DE + PT as expansion.

Why:

- Ukrainian testers will react more honestly in their native language.
- Early UX problems should not be mixed with language-comprehension problems.
- Later, translation can follow validated structure.

## How To Open On Mobile

### Option A: Simple Local File

Works if you manually transfer the folder to the phone.

Files needed:

- `prototype_stage4_ua/index.html`
- `prototype_stage4_ua/app.js`
- `prototype_stage4/styles.css`

Limitation:

- localStorage works on the phone browser, but sharing updates is inconvenient.

### Option B: Same Wi-Fi Local Server

Recommended for quick testing in one room.

From the project folder, run a local static server and open the computer's local IP on the phone.

Example URL:

```text
http://YOUR_LOCAL_IP:8000/prototype_stage4_ua/
```

Limitation:

- phone and computer must be on the same Wi-Fi.
- firewall may block access.

### Option C: Temporary Public Link

Recommended for remote interviews.

Possible tools:

- GitHub Pages;
- Netlify;
- Vercel;
- Cloudflare Pages;
- any static hosting.

The project is static, so no backend is needed for the prototype.

Important:

- Do not collect real sensitive child data during prototype testing.
- Tell testers this is a prototype.
- Use fake or minimal notes if they are sharing screens.

## Mobile UX Checklist

Before interviews, check on a real phone:

- hero text fits;
- tabs are easy to tap;
- milestone buttons are not too small;
- History is understandable;
- Summary is readable;
- starter pack form is not annoying;
- no text overlaps;
- page loads without server logic.

## Privacy Note For Testers

Say this before testing:

> Це прототип. Ваші позначки зберігаються тільки у браузері на цьому пристрої. Це не медична карта, не діагностика і не скринінг.

