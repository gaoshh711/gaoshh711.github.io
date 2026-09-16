// Run with: node _scripts/zoom.test.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

class Style {
  get cssText() {
    return JSON.stringify(this);
  }
  set cssText(value) {
    Object.keys(this).forEach((key) => delete this[key]);
    Object.assign(this, JSON.parse(value));
  }
  setProperty(key, value) {
    this[key] = value;
  }
  removeProperty(key) {
    delete this[key];
  }
}

const handlers = {};
const zoom = { on: (event, handler) => (handlers[event] = handler) };
let images = [];
vm.runInNewContext(fs.readFileSync(`${__dirname}/../assets/js/zoom.js`, "utf8"), {
  $: () => ({ ready: (callback) => callback() }),
  mediumZoom: () => zoom,
  getComputedStyle: () => ({ getPropertyValue: () => "#ffffff" }),
  document: { querySelectorAll: () => images },
  window: { scrollX: 5, scrollY: 300 },
});

// Exercise both the normal clone and an optional HD clone, including reopening.
for (const count of [1, 2, 1]) {
  images = Array.from({ length: count }, () => {
    const style = Object.assign(new Style(), { width: "125px", height: "75px", top: "400px", left: "20px", transform: "scale(8)" });
    return {
      style,
      getBoundingClientRect: () => ({ width: 1000, height: 600, left: 50, top: 30 }),
      get offsetWidth() {
        assert.equal(style.width, "125px");
        assert.equal(style.transform, "scale(8)");
        assert.equal(style.transition, "none");
        return 125;
      },
    };
  });
  handlers.opened();
  for (const { style } of images) {
    assert.equal(style.width, "1000px");
    assert.equal(style.height, "600px");
    assert.equal(style.left, "55px");
    assert.equal(style.top, "330px");
    assert.equal(style.transform, "none");
    assert.equal(style.willChange, "auto");
  }
  // medium-zoom clears transforms before dispatching its close event.
  images.forEach(({ style }) => (style.transform = ""));
  handlers.close();
  for (const { style } of images) {
    assert.equal(style.width, "125px");
    assert.equal(style.height, "75px");
    assert.equal(style.top, "400px");
    assert.equal(style.left, "20px");
    assert.equal(style.transform, "");
    assert.equal(style.transition, undefined);
    assert.equal(style.willChange, undefined);
  }
}
console.log("Zoom geometry and close/reopen checks passed.");
