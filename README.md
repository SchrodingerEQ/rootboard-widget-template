# rootboard-widget-template

A starter template for building your own [Rootboard](https://github.com/SchrodingerEQ/Rootboard.me)
widget. Copy the `hello-world/` folder, edit two lines, drop it onto
your kiosk, and you have a working widget.

## What a widget is

A Rootboard widget is a **folder** with a manifest and one
self-contained script — nothing else:

```
my-widget/
  widget.json     # manifest describing your widget
  index.js        # plain ESM module — no build step
  icon.svg        # optional nav icon
```

`index.js` is plain JavaScript ES modules: no bundler, no framework
required, no build step. If you want a framework (React, Preact, etc.)
you bundle it into `index.js` yourself — the host provides no shared
runtime beyond the DOM and one `host` object your widget receives on
mount. `hello-world/index.js` in this repo is that entire contract
demonstrated in ~140 commented lines; read it start to finish.

## 60-second quickstart

1. Copy the `hello-world/` folder and rename it — the new folder name
   becomes your widget's identity.
2. Open `widget.json` in your new folder and change `id` and `name` to
   match (the `id` field must equal the folder name).
3. Copy the renamed folder into `widgets/` at the root of your
   Rootboard install (over SSH, SD card, or however you reach the
   kiosk's filesystem).
4. On the kiosk, open **Settings → Widgets** and enable it.

That's it — no restart, no build, no server round-trip beyond the
kiosk picking up the new folder.

## Trust model

**There is no sandbox** — a widget runs with the same access to the
page, DOM, network, and API as Rootboard itself, so only install
widgets you trust, the same as installing any other software. See
[CONTRACT §7](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#7-trust-model-v1--stated-plainly)
for the full statement.

## Learn more

- [CONTRACT.md](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md) —
  the normative widget contract (manifest fields, lifecycle, host
  services, trust model). This is the source of truth; everything else
  here and in this repo is a convenience layer on top of it.
- [MANIFEST-REFERENCE.md](MANIFEST-REFERENCE.md) — a field-by-field
  table for `widget.json`, linked back to the contract sections it
  summarizes.
- [TUTORIAL.md](TUTORIAL.md) — build your first widget from scratch in
  about 30 minutes.
- [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon) — how to build and share a widget
  today, and the ground rules for doing so.
- [Rootboard](https://github.com/SchrodingerEQ/Rootboard.me) — the
  kiosk app itself.

## License

MIT — see [LICENSE](LICENSE). Copy `hello-world/` and build whatever
you like; no attribution required (though appreciated).
