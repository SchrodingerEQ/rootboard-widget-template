# `widget.json` manifest reference

> **This is a convenience copy, not the source of truth.** The
> [Rootboard Widget Contract](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md)
> (`CONTRACT.md` in the main Rootboard repo) is normative. If this file
> and the contract ever disagree, the contract wins — every rule below
> links to the contract section it's drawn from. This document only
> covers the manifest ([§2](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#2-manifest--widgetjson));
> the lifecycle, host services, and trust model live in the contract
> itself.

`widget.json` sits next to your entry module and is validated by the
host before your widget is ever loaded. See `hello-world/widget.json`
in this repo for a working example.

## Top-level fields

| Field | Type | Required | Rules |
|---|---|---|---|
| `id` | string | yes | Must match `^[a-z0-9][a-z0-9-]{1,40}$`, must equal the widget's **folder name**, and must be unique across everything installed on that Rootboard. ([§2](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#2-manifest--widgetjson)) |
| `name` | string | yes | 1–40 characters. Shown in the nav rail and the layout picker. ([§2](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#2-manifest--widgetjson)) |
| `version` | string | yes | Semver `MAJOR.MINOR.PATCH`. Your own version — the host doesn't act on it beyond validating the shape. ([§2](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#2-manifest--widgetjson)) |
| `apiVersion` | integer | yes | The contract version your widget targets — `1` today. The host rejects (lists but never loads) any manifest whose `apiVersion` is greater than its own supported version, with the message "built for a newer Rootboard". ([§6](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#6-discovery-validation-loading)) |
| `entry` | string | yes | Relative path to your ESM entry module (no `..` segments). `index.js` by convention. ([§2](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#2-manifest--widgetjson)) |
| `slots` | string[] | yes | In v1 must include `"section"` (the only slot type that exists today — your widget occupies the full content area when active). Unknown slot names are ignored, for forward compatibility. ([§1](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#1-what-a-widget-is)) |
| `description` | string | no | ≤200 characters. Shown in the layout picker. |
| `icon` | string | no | Relative path to an SVG or PNG in your folder. Rendered by the host via `<img src>` only — never inlined or executed. ([§2](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#2-manifest--widgetjson)) |
| `refresh` | object | no | `{ "intervalSeconds": number }`, minimum **30**. While your widget is visible, the app is online, and the screensaver isn't active, the host calls your `refresh()` on this cadence. Don't run your own polling loop for refreshable data. ([§3](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#3-entry-module-and-lifecycle)) |
| `settings` | array | no | Field descriptors that drive the host's built-in settings editor. See below. ([§2](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#2-manifest--widgetjson)) |

## Settings descriptors

Each entry in `settings` is:

```json
{ "key": "...", "label": "...", "type": "...", "default": ..., "options": [...] }
```

| Property | Required | Notes |
|---|---|---|
| `key` | yes | The property name under which the value is stored and handed to your widget via `host.settings.get()`. |
| `label` | yes | Shown next to the field in the settings editor. |
| `type` | yes | One of `"string"`, `"number"`, `"boolean"`, `"select"` — v1 supports no other types. |
| `default` | no | Initial value before a user edits it. |
| `options` | required iff `type` is `"select"` | Array of `{ "value": ..., "label": ... }`. |

Widgets never write their own settings directly — the one write path is
`host.settings.patch()`, which the host validates and persists. See
[§4](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#4-host-services--widgethost)
for the full `WidgetHost` surface.

## Example

```json
{
  "id": "grocery-list",
  "name": "Grocery List",
  "version": "1.0.0",
  "apiVersion": 1,
  "entry": "index.js",
  "slots": ["section"],
  "refresh": { "intervalSeconds": 300 },
  "settings": [
    { "key": "sortMode", "label": "Sort", "type": "select",
      "default": "manual",
      "options": [
        { "value": "manual", "label": "Manual" },
        { "value": "alpha", "label": "A-Z" }
      ] }
  ]
}
```

## Everything else

Lifecycle (`mount`/`unmount`/`refresh`/`onVisibilityChange`), the
`WidgetHost` services (`storage`, `settings`, `theme`, `fetch`, `ui`),
discovery/loading rules, and the trust model are all covered in the
contract, not here:

- [§3 — Entry module and lifecycle](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#3-entry-module-and-lifecycle)
- [§4 — Host services (`WidgetHost`)](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#4-host-services--widgethost)
- [§6 — Discovery, validation, loading](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#6-discovery-validation-loading)
- [§7 — Trust model](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#7-trust-model-v1--stated-plainly)
- [§8 — Widget author rules](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#8-widget-author-rules)
