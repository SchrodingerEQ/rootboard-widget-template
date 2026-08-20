# Build your first widget in 30 minutes

This walks you from a fresh clone of this template to your own working
widget — a "Quote of the Day" — built by copying and progressively
editing `hello-world/`. Every code listing below is complete and meant
to be pasted as-is; nothing is abbreviated with "add something like...".

**Trust model, up front:** there is no sandbox. A widget you install
runs with the same access to the page, DOM, network, and API as
Rootboard itself — only build and install widgets you trust, the same
as any other software. See
[CONTRACT §7](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#7-trust-model-v1--stated-plainly)
for the full statement.

Budget: about 30 minutes total, in seven steps.

## 1. What you need (2 min)

- Either a real Rootboard kiosk you can reach (over SSH or by pulling
  its SD card), **or** a clone of
  [Rootboard.me](https://github.com/SchrodingerEQ/Rootboard.me) running
  in dev mode (`npm install`, then `npm run dev`, serving at
  `http://localhost:5000`). This tutorial's screenshots-in-words assume
  dev mode; the SSH/SD path is called out separately in step 3.
- A text editor. Nothing fancier.
- No build tools for the widget itself — `index.js` is plain ESM you
  can open, edit, and save. (Running Rootboard itself in dev mode does
  need Node, but that's the host app, not your widget.)

## 2. Copy hello-world → quote-of-day (3 min)

From the root of your clone of this template repo:

```
cp -r hello-world quote-of-day
```

(Or copy-and-rename the folder in a file manager — same result.)

Open `quote-of-day/widget.json` and replace its contents with:

```json
{
  "id": "quote-of-day",
  "name": "Quote of the Day",
  "description": "A rotating quote from a small built-in list.",
  "version": "1.0.0",
  "apiVersion": 1,
  "entry": "index.js",
  "icon": "icon.svg",
  "slots": ["section"]
}
```

This drops hello-world's `greeting` setting (it doesn't apply here —
you'll add your own setting in step 6) and renames the widget.

**The rule that matters: `id` must equal the folder name.** The host
validates every manifest against its folder on load
([CONTRACT §2](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#2-manifest--widgetjson)) —
a folder named `quote-of-day` with `"id": "something-else"` is rejected
as invalid and never mounts. Keep the two in sync any time you rename
either one.

Leave `index.js` and `icon.svg` untouched for now — you'll rewrite
`index.js` in step 4.

## 3. Sideload + enable (5 min) — first checkpoint

**On a real kiosk (SSH or SD card):** copy the whole `quote-of-day/`
folder into `widgets/` at the root of the Rootboard install directory
— the same directory that contains `server/`, `client/`, and `data/`.
`widgets/` is on the auto-updater's preserve list, so sideloaded
widgets survive updates.

**In dev mode:** in your Rootboard.me checkout, create a `widgets/`
folder at the repo root if one doesn't already exist, and copy
`quote-of-day/` into it — same folder, same rule, just a local path
instead of SSH/SD. `widgets/` is gitignored there too, so this never
touches git.

Either way, no restart is required — the server re-scans `widgets/` on
every request. The browser tab polls for new folders every 60 seconds,
so reload the page once after copying if you don't see your widget
show up right away.

Now enable it. **The Settings gear only appears in the nav rail once a
Google Calendar is connected** — on a real kiosk that's normally already
done, so: tap the gear icon, scroll to the **Community Widgets**
section, find "Quote of the Day", and flip its switch on.

**In dev mode with no calendar connected yet** (the common case for a
fresh clone), there's no gear icon to tap — use the same mechanism the
UI itself is built on. The dashboard's widget list is a plain JSON file,
`data/config/dashboard.json`, and hand-edits to it are picked up on the
next reload, no restart needed
([CONTRACT §5](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#5-dashboard-config--the-source-of-truth)).
On a genuinely fresh clone this file doesn't exist yet (it's
gitignored — deployment-specific, never shipped) and the app is running
on built-in defaults. Create `data/config/dashboard.json` with:

```json
{
  "configVersion": 1,
  "defaultWidget": "quote-of-day",
  "widgets": [
    { "id": "calendar", "enabled": true, "settings": {} },
    { "id": "chores", "enabled": true, "settings": {} },
    { "id": "dinner", "enabled": true, "settings": {} },
    { "id": "quote-of-day", "enabled": true, "settings": {} }
  ]
}
```

(If the file already exists, just add the `quote-of-day` entry to its
`widgets` array instead of replacing the whole thing.) Save and reload
the page in your browser.

**Checkpoint:** a new "Quote of the Day" entry appears in the nav
rail. Tap it — you'll see hello-world's original greeting-and-counter
UI, just under the new name. That's expected: you haven't touched
`index.js` yet. If it mounts and shows something, the plumbing works
and you're ready for step 4. If the widget doesn't appear at all,
re-check that the folder is literally named `quote-of-day` (not
`hello-world` or something else) and that `id` in `widget.json` matches
it exactly.

---

**⚠️ Important:** From this point on, **edit the copy you sideloaded into
your Rootboard's `widgets/quote-of-day/` folder directly.** That's your
live copy — the folder you copied from this template repo is just your
starting point and won't affect your running app. Steps 4–6 all edit the
copy in Rootboard, not the template.

---

## 4. Make it yours: quotes + a "next quote" button (7 min)

In your Rootboard's `widgets/` folder, replace `quote-of-day/index.js`
entirely with:

```js
// quote-of-day — built from hello-world by following TUTORIAL.md.
// Plain, framework-free ESM — no build step, no bundler (CONTRACT §3).

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Programs must be written for people to read.", author: "Harold Abelson" },
];

export default {
  mount(container, host) {
    // ---- local state ---------------------------------------------------
    let index = 0; // which QUOTES entry is showing

    // ---- build the DOM once ---------------------------------------------
    const root = document.createElement("div");
    root.style.padding = "24px";
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.gap = "16px";
    root.style.color = "var(--rb-ink)"; // theme token — CONTRACT §4 "theme"

    const quoteText = document.createElement("p");
    quoteText.style.margin = "0";
    quoteText.style.fontSize = "24px";
    quoteText.style.lineHeight = "1.4";
    root.appendChild(quoteText);

    const authorText = document.createElement("p");
    authorText.style.margin = "0";
    authorText.style.fontSize = "16px";
    authorText.style.color = "var(--rb-muted)";
    root.appendChild(authorText);

    // Meets the kiosk's 48px minimum touch target (CONTRACT §8).
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next quote";
    nextButton.style.alignSelf = "flex-start";
    nextButton.style.minHeight = "48px";
    nextButton.style.minWidth = "48px";
    nextButton.style.padding = "0 20px";
    nextButton.style.borderRadius = "8px";
    nextButton.style.border = "1px solid var(--rb-border-strong)";
    nextButton.style.background = "var(--rb-surface)";
    nextButton.style.color = "var(--rb-ink)";
    nextButton.style.font = "inherit";
    nextButton.style.cursor = "pointer";
    root.appendChild(nextButton);

    container.appendChild(root);

    function renderQuote() {
      const quote = QUOTES[index];
      quoteText.textContent = `"${quote.text}"`;
      authorText.textContent = `— ${quote.author}`;
    }
    renderQuote();

    nextButton.addEventListener("click", () => {
      index = (index + 1) % QUOTES.length;
      renderQuote();
    });

    // ---- return the WidgetInstance ----------------------------------------
    return {
      // Called only when the widget is disabled, its folder removed, or the
      // app shuts down — never on an ordinary nav switch (CONTRACT §3).
      unmount() {
        container.textContent = "";
      },
    };
  },
};
```

Save the file, then **reload the page** (a full reload, not just
switching sections — the browser only re-fetches and re-runs
`index.js` on a real reload). Open "Quote of the Day" again: you now
see a quote and author, with a "Next quote" button that cycles through
the list. Nothing persists yet — reload again and you're back to the
first quote. That's step 5.

## 5. Persist state: remember the last-shown quote (4 min)

Add a `host.storage` round trip to your live `widgets/quote-of-day/index.js`
so the widget remembers which quote was showing across reloads. `host.storage`
is one persistent JSON blob per widget, read once on mount and written on
every change — reads happen up front, writes are fire-and-forget and debounced
by the host, so your widget never has to manage retries or block the UI on a
save; the host's job is to make sure that write eventually lands without you
thinking about it.

Insert this block right after `renderQuote();` (the first call to it),
and change the click handler as shown:

```js
    // ---- host.storage: remember which quote was showing ------------------
    // One persistent JSON blob per widget (CONTRACT §4), backed by app_state
    // key "widget:quote-of-day".
    host.storage.get().then((stored) => {
      if (typeof stored === "number" && stored >= 0 && stored < QUOTES.length) {
        index = stored;
        renderQuote();
      }
    });

    nextButton.addEventListener("click", () => {
      index = (index + 1) % QUOTES.length;
      renderQuote();
      host.storage.set(index);
    });
```

(This replaces the plain `nextButton.addEventListener` block from step
4 — same event, now also writing to storage.)

Reload, click "Next quote" a couple of times, then reload again: the
widget reopens on the same quote you left it on.

## 6. Add a setting: `showAuthor` (5 min)

Widgets declare settings in `widget.json`; the host renders them in its
settings editor and hands the current values to your widget through
`host.settings.get()` / `host.settings.subscribe()` — your widget never
writes its own settings directly (the one exception,
`host.settings.patch()`, doesn't come up here). In your Rootboard's
`widgets/` folder, replace `quote-of-day/widget.json` with:

```json
{
  "id": "quote-of-day",
  "name": "Quote of the Day",
  "description": "A rotating quote from a small built-in list, with an optional author byline.",
  "version": "1.0.0",
  "apiVersion": 1,
  "entry": "index.js",
  "icon": "icon.svg",
  "slots": ["section"],
  "settings": [
    { "key": "showAuthor", "label": "Show author", "type": "boolean", "default": true }
  ]
}
```

Then in your Rootboard's `widgets/quote-of-day/index.js`, add a `showAuthor`
variable next to `index`, read and subscribe to it immediately after the
storage block from step 5, and make `renderQuote` respect it:

```js
    let index = 0; // which QUOTES entry is showing
    let showAuthor = true; // overwritten from host.settings.get() below
```

```js
    function renderQuote() {
      const quote = QUOTES[index];
      quoteText.textContent = `"${quote.text}"`;
      authorText.textContent = showAuthor ? `— ${quote.author}` : "";
    }
    renderQuote();
```

```js
    // ---- host.settings: read + live-subscribe to "showAuthor" ------------
    // (CONTRACT §2, §4). This widget only reads the value — it never calls
    // host.settings.patch() itself.
    function applySettings(values) {
      showAuthor = values.showAuthor !== false; // default true
      renderQuote();
    }
    applySettings(host.settings.get());
    const unsubscribeSettings = host.settings.subscribe(applySettings);
```

And unsubscribe in `unmount()`:

```js
      unmount() {
        unsubscribeSettings();
        container.textContent = "";
      },
```

If you'd rather paste one complete file instead of assembling the
pieces above, here is `index.js` with steps 4–6 all applied:

```js
// quote-of-day — built from hello-world by following TUTORIAL.md. Same
// contract touch points as hello-world/index.js, demonstrated on a
// different widget: a rotating quote instead of a counter.
//
// Plain, framework-free ESM — no build step, no bundler (CONTRACT §3).

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Programs must be written for people to read.", author: "Harold Abelson" },
];

export default {
  mount(container, host) {
    // ---- local state ---------------------------------------------------
    let index = 0; // which QUOTES entry is showing
    let showAuthor = true; // overwritten from host.settings.get() below

    // ---- build the DOM once ---------------------------------------------
    const root = document.createElement("div");
    root.style.padding = "24px";
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.gap = "16px";
    root.style.color = "var(--rb-ink)"; // theme token — CONTRACT §4 "theme"

    const quoteText = document.createElement("p");
    quoteText.style.margin = "0";
    quoteText.style.fontSize = "24px";
    quoteText.style.lineHeight = "1.4";
    root.appendChild(quoteText);

    const authorText = document.createElement("p");
    authorText.style.margin = "0";
    authorText.style.fontSize = "16px";
    authorText.style.color = "var(--rb-muted)";
    root.appendChild(authorText);

    // Meets the kiosk's 48px minimum touch target (CONTRACT §8).
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next quote";
    nextButton.style.alignSelf = "flex-start";
    nextButton.style.minHeight = "48px";
    nextButton.style.minWidth = "48px";
    nextButton.style.padding = "0 20px";
    nextButton.style.borderRadius = "8px";
    nextButton.style.border = "1px solid var(--rb-border-strong)";
    nextButton.style.background = "var(--rb-surface)";
    nextButton.style.color = "var(--rb-ink)";
    nextButton.style.font = "inherit";
    nextButton.style.cursor = "pointer";
    root.appendChild(nextButton);

    container.appendChild(root);

    function renderQuote() {
      const quote = QUOTES[index];
      quoteText.textContent = `"${quote.text}"`;
      authorText.textContent = showAuthor ? `— ${quote.author}` : "";
    }
    renderQuote();

    // ---- host.storage: remember which quote was showing ------------------
    // One persistent JSON blob per widget (CONTRACT §4), backed by app_state
    // key "widget:quote-of-day". Read once on mount; every change is
    // written with host.storage.set(), which is fire-and-forget/debounced
    // by the host — the widget never manages retries itself. That's the
    // whole "never lose data" posture: reads happen once up front, writes
    // are best-effort and don't block the UI.
    host.storage.get().then((stored) => {
      if (typeof stored === "number" && stored >= 0 && stored < QUOTES.length) {
        index = stored;
        renderQuote();
      }
    });

    nextButton.addEventListener("click", () => {
      index = (index + 1) % QUOTES.length;
      renderQuote();
      host.storage.set(index);
    });

    // ---- host.settings: read + live-subscribe to "showAuthor" ------------
    // (CONTRACT §2, §4). Declared in widget.json; edited through the host's
    // settings editor — this widget only reads it, it never calls
    // host.settings.patch() itself.
    function applySettings(values) {
      showAuthor = values.showAuthor !== false; // default true
      renderQuote();
    }
    applySettings(host.settings.get());
    const unsubscribeSettings = host.settings.subscribe(applySettings);

    // ---- return the WidgetInstance ----------------------------------------
    return {
      // Called only when the widget is disabled, its folder removed, or the
      // app shuts down — never on an ordinary nav switch (CONTRACT §3).
      unmount() {
        unsubscribeSettings();
        container.textContent = "";
      },
    };
  },
};
```

Reload once to pick up the new `settings` field and `showAuthor`'s
`true` default. From here, toggling it depends on which path you used
in step 3:

- **Settings UI (calendar connected):** open the widget's settings (the
  sliders icon next to its row in Community Widgets) and flip "Show
  author" off — the byline disappears immediately, no reload needed,
  because `subscribe()` delivers the change live.
- **Hand-edited `dashboard.json`:** change your widget's entry to
  `{ "id": "quote-of-day", "enabled": true, "settings": { "showAuthor": false } }`
  and save. The client polls the config file every 60 seconds, so
  either wait a minute or reload to see the byline disappear right
  away — either way, `index.js` never changes for a settings edit.

## 7. Polish (3 min)

You've already been doing this, but it's worth naming explicitly:

- **Theme tokens.** Every color above is `var(--rb-ink)`,
  `var(--rb-muted)`, `var(--rb-surface)`, `var(--rb-border-strong)` —
  never a hardcoded hex value. That's the entire cost of theme support;
  the host repaints these variables when the theme changes and your
  widget follows along for free.
- **48px touch targets.** `nextButton`'s `minHeight`/`minWidth` are
  both `48px`, the kiosk's minimum
  ([CONTRACT §8](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#8-widget-author-rules)).
  No hover-only affordances, either — there's no mouse on a kiosk.
- **Idempotent visibility handling.** `quote-of-day` doesn't implement
  `onVisibilityChange` — it has no private timers or polling to pause,
  so there's nothing to do when the section is hidden. If you ever add
  one (hello-world's does, as a reference), keep in mind the host may
  call it more than once with the same value in a row
  ([CONTRACT §3](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#3-entry-module-and-lifecycle)) —
  write the handler so calling it twice with `true` (or twice with
  `false`) is harmless.

## Where to go next

- [MANIFEST-REFERENCE.md](MANIFEST-REFERENCE.md) — every `widget.json`
  field, in one table.
- [CONTRACT.md](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md) —
  the full normative contract: lifecycle, all of `WidgetHost`, discovery
  rules, and the trust model this tutorial only summarized.
- [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon) — how to build and
  share a widget today, and the ground rules for doing so.
