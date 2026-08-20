# Contributing a widget

This is a starter template, not a submission portal — there's no build
queue and nothing to submit *here*. "Contributing" means building a
widget, hosting it yourself, and telling people about it. Here's how.

## Build a widget

Start with [TUTORIAL.md](TUTORIAL.md) to build one from scratch in about
30 minutes, use [MANIFEST-REFERENCE.md](MANIFEST-REFERENCE.md) as a
field-by-field lookup for `widget.json` while you work, and treat
[CONTRACT.md](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md)
in the main Rootboard repo as the final word on anything the other two
don't cover.

## Share it today

There's no central hosting for widgets, so sharing one is simple and
manual:

1. **Host it in your own public repo.** Any public git host works —
   GitHub, GitLab, a personal server, whatever you already use.
2. **Add install instructions to your README.** The install step is
   always the same one: copy your widget's folder into `widgets/` at
   the root of someone's Rootboard install. Say that plainly, plus
   anything specific to your widget (settings to configure, etc.).
3. **Submit a PR to [awesome-rootboard](https://github.com/SchrodingerEQ/awesome-rootboard)**
   adding your widget to the community list, so people looking for
   widgets can find it.

That's the whole distribution model: repo-to-repo, discovered through a
shared list. See below for why nothing fancier exists yet.

## The trust model

This is the single most important thing to understand before you build
or install anything. From
[CONTRACT §7](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#7-trust-model-v1--stated-plainly):

> **There is no sandbox.** A widget's entry module runs with full access
> to the page, the DOM, the network, and the same-origin API — the same
> access the app itself has. Rootboard is a local kiosk appliance:
> **install only widgets you trust**, exactly as you would when
> installing software on any computer. A permission system is
> explicitly out of scope for v1; if one ever lands it will arrive as an
> `apiVersion` bump, not a silent behavior change.

For authors, that means: write the kind of code you'd be comfortable
running on your own family's kiosk, because that's exactly what you're
asking others to do. For users, it means: install only widgets you
trust, the same as installing any other software on any other computer
— there's no sandbox standing between a widget and your kiosk.

## Ground rules

- **No third-party IP.** Don't build a widget around someone else's
  names, logos, or characters unless you own the rights or have a
  license that covers it. This mirrors
  [Rootboard's theme policy](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/theme-system/THEME-SYSTEM-PLAN.md):
  your widget should be your own work, or work you're properly licensed
  to share.
- **State your widget's purpose plainly.** Say what it does — and what
  it doesn't — in your README and its `description` field. Don't
  overpromise or imply capabilities it doesn't have.
- **No remote code.** Your entry bundle must be complete at install
  time — fetching *data* at runtime is fine, `import()`ing remote
  *code* is not
  ([CONTRACT §8](https://github.com/SchrodingerEQ/Rootboard.me/blob/main/docs/plans/widget-system/CONTRACT.md#8-widget-author-rules)).

## What doesn't exist (yet, maybe ever)

To be honest about where things stand: there is no marketplace, no
central registry, and no auto-update mechanism for community widgets.
Installing one means copying a folder yourself, and updating one means
copying it again. That's a deliberate choice, not an oversight — a real
registry needs hosting and, more importantly, someone reviewing every
submission for malicious code and IP problems, and that's more than a
solo-founder project can support today. It may never exist. Sharing
stays repo-to-repo and word-of-mouth via
[awesome-rootboard](https://github.com/SchrodingerEQ/awesome-rootboard)
for the foreseeable future, and that's fine — it's what keeps this
honest about what it actually is.

## Getting help

Stuck, found a bug in the contract or this template, or have a question
that isn't answered above? Open an issue on the
[Rootboard repo](https://github.com/SchrodingerEQ/Rootboard.me/issues).
