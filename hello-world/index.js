// hello-world — a minimal, fully-commented example of the Rootboard widget
// contract (apiVersion 1). Read this alongside docs/plans/widget-system/
// CONTRACT.md; every host touch point below is called out with the
// section of the contract it demonstrates.
//
// This file is plain, framework-free ESM — no build step, no bundler.
// A widget that DOES want a framework (React, Preact, etc.) must bundle
// it into this file completely; the host provides no shared runtime and
// no import map (CONTRACT §3). Vanilla DOM was chosen here specifically
// so this file needs no build step and can be read start-to-finish.

export default {
  // mount() is called once when the widget becomes enabled, and the
  // instance is kept alive across nav switches (CONTRACT §3: "keep-alive
  // mounting") — do first-time setup here, not per-visit setup.
  mount(container, host) {
    // ---- local state -------------------------------------------------
    // Nothing here is persistent by itself; `count` only survives a
    // reload because every change is also written to host.storage below.
    let count = 0;
    let greeting = "Hello"; // overwritten from host.settings.get() shortly

    // ---- build the DOM once -------------------------------------------
    const root = document.createElement("div");
    // Gives the injected stylesheet below something scoped to select —
    // an unscoped selector would leak outside `container`, which
    // CONTRACT §8 doesn't allow ("touch only container, host, and your
    // own bundled code").
    root.id = `rb-hello-world-${host.widgetId}`;
    root.style.padding = "24px";
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.gap = "16px";
    root.style.color = "var(--rb-ink)"; // theme token — see CONTRACT §4 "theme"

    // CONTRACT §8 also asks for 56px touch targets on ≥1920px screens (up
    // from the 48px baseline makeButton() sets below) — a media query, so
    // it can't be expressed via inline style.* assignments the way the
    // rest of this file is. A small scoped <style> element is the
    // contract-legal way to add one from inside the widget's own subtree.
    const touchTargetStyle = document.createElement("style");
    touchTargetStyle.textContent = `
      @media (min-width: 1920px) {
        #${root.id} button { min-height: 56px; min-width: 56px; }
      }
    `;
    root.appendChild(touchTargetStyle);

    const heading = document.createElement("h1");
    heading.style.margin = "0";
    heading.style.fontSize = "28px";
    root.appendChild(heading);

    const countLine = document.createElement("p");
    countLine.style.margin = "0";
    countLine.style.color = "var(--rb-muted)";
    root.appendChild(countLine);

    const visibilityLine = document.createElement("p");
    visibilityLine.style.margin = "0";
    visibilityLine.style.fontSize = "13px";
    visibilityLine.style.color = "var(--rb-faint)";
    root.appendChild(visibilityLine);

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "12px";
    root.appendChild(row);

    // Buttons meet the kiosk's 48px minimum touch target (CONTRACT §8).
    function makeButton(label) {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.style.minHeight = "48px";
      btn.style.minWidth = "48px";
      btn.style.padding = "0 20px";
      btn.style.borderRadius = "8px";
      btn.style.border = "1px solid var(--rb-border-strong)";
      btn.style.background = "var(--rb-surface)";
      btn.style.color = "var(--rb-ink)";
      btn.style.font = "inherit";
      btn.style.cursor = "pointer";
      return btn;
    }

    const incrementButton = makeButton("Increment");
    const sleepButton = makeButton("Sleep");
    row.appendChild(incrementButton);
    row.appendChild(sleepButton);

    container.appendChild(root);

    function renderText() {
      heading.textContent = `${greeting}, Rootboard!`;
      countLine.textContent = `Count: ${count}`;
    }
    renderText();

    // ---- host.storage: one persistent JSON blob per widget -----------
    // Backed server-side by app_state key "widget:hello-world" (CONTRACT
    // §4). Read once on mount; every subsequent change is written with
    // host.storage.set(), which is fire-and-forget/debounced by the host
    // — the widget never needs to manage retries itself.
    host.storage.get().then((stored) => {
      if (typeof stored === "number") {
        count = stored;
        renderText();
      }
    });

    incrementButton.addEventListener("click", () => {
      count += 1;
      renderText();
      host.storage.set(count);
    });

    // ---- host.settings: read + live-subscribe to manifest-declared
    // settings (CONTRACT §2, §4). This widget declares one field,
    // "greeting" (see widget.json), edited through the host's settings
    // editor in the layout picker — the widget never writes it directly
    // (there is no host.settings.patch() call here) and never has to
    // poll for changes: subscribe() delivers every update as it happens.
    function applySettings(values) {
      greeting = typeof values.greeting === "string" && values.greeting.length > 0
        ? values.greeting
        : "Hello";
      renderText();
    }
    applySettings(host.settings.get());
    const unsubscribeSettings = host.settings.subscribe(applySettings);

    // ---- host.ui.sleep(): request the shell's power-saving overlay ---
    // (CONTRACT §4). The widget only *requests* it; dimming/timing/exit
    // remain entirely shell-owned.
    sleepButton.addEventListener("click", () => {
      host.ui.sleep();
    });

    // ---- return the WidgetInstance ------------------------------------
    return {
      // Called when the widget is disabled, its folder is removed, or
      // the app shuts down — never on an ordinary nav switch (CONTRACT
      // §3). Undo everything mount() set up: unsubscribe, detach DOM.
      unmount() {
        unsubscribeSettings();
        container.textContent = "";
      },

      // Fires when this widget's section is shown/hidden, and when the
      // screensaver dims/wakes (dim => false). Optional — implemented
      // here only to demonstrate the pattern; a widget with no private
      // timers/polling doesn't need this at all. Callbacks may repeat
      // the current value, so handlers must be idempotent (CONTRACT §3)
      // — this one just re-renders the same text, which is safe to call
      // any number of times in a row.
      onVisibilityChange(visible) {
        visibilityLine.textContent = visible
          ? "Widget is visible."
          : "Widget is hidden (screensaver or different section).";
      },
    };
  },
};
