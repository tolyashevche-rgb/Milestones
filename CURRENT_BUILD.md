# Current build — read before running or auditing

**Current product UI:** Stage 5 UA, release **P2.51**.

**Canonical entry point:** `prototype_stage5_ua/index.html`

This is the only UI that may be used for product, UI/UX, accessibility, content-placement,
or feature audits. An audit that opens a Stage 4 HTML file is invalid for the current build.

## Run and verify

From the repository root:

```powershell
py -m http.server 8000
```

Open:

```text
http://127.0.0.1:8000/prototype_stage5_ua/index.html
```

Run regression QA:

```powershell
node tools/test_p1_qa.js
```

## Audit scope

Use the files in `prototype_stage5_ua/` for the current interface. The only Stage 4 UA
files used by the current app at runtime are:

- `prototype_stage4_ua/data_ua.js` — curated Ukrainian content;
- `prototype_stage4_ua/engine.js` — personalization logic.

Do **not** use these as current UI evidence:

- `prototype_stage4/legacy-reference.html`, `app.js`, or `styles.css`;
- `prototype_stage4_ua/legacy-reference.html` or `app.js`;
- anything under `archive/`, `_tmp_*`, `tmp/`, or an expert-review ZIP;
- historical screenshots, frozen review baselines, or old plans when the running Stage 5
  interface can be inspected directly.

## Required audit preflight

Before reporting findings, record:

1. the output of `git rev-parse HEAD`;
2. the entry point inspected — it must be `prototype_stage5_ua/index.html`;
3. the visible release/cache marker — currently `P2.51` / `20260708-p2-51-r1`;
4. whether the regression suite passed;
5. the exact route(s) inspected.

If any of these cannot be confirmed, label the review as an unverified historical review,
not an audit of the current product.
