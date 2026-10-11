import test from "node:test";
import assert from "node:assert/strict";
import { theme, quietTheme, cssVariablesResolver } from "../src/theme.js";

function luminance(hex) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels.reduce(
    (sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i],
    0,
  );
}
const contrast = (a, b) => {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
};
test("text, semantic colours, highlights and essential borders meet contrast targets", () => {
  const c = quietTheme.colors;
  const surfaces = cssVariablesResolver().variables;
  for (const surface of ["#ffffff", surfaces["--carrowmore-page"], surfaces["--carrowmore-workspace"], c.gray[0], c.gray[1]]) {
    for (const text of [
      c.gray[9],
      c.gray[6],
      c.carrowmore[7],
      c.evidence[7],
      c.clarification[7],
      c.documented[7],
      c.red[6],
    ])
      assert.ok(contrast(text, surface) >= 4.5, `${text} on ${surface}`);
    assert.ok(contrast(c.gray[4], surface) >= 3);
  }
  assert.ok(contrast("#ffffff", c.carrowmore[7]) >= 4.5);
  assert.ok(contrast(c.gray[9], c.evidence[1]) >= 4.5);
});
test("one central Plex theme preserves layout scales", () => {
  assert.equal(theme, quietTheme);
  assert.match(theme.fontFamily, /IBM Plex Sans/);
  assert.equal(theme.fontSizes.xs, "0.8125rem");
  assert.equal(quietTheme.colors.carrowmore[7], "#243951");
  for (const key of ["spacing", "radius", "breakpoints"])
    assert.equal(quietTheme[key], undefined);
});
