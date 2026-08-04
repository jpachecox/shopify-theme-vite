import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { compileString } from 'sass-embedded';

const projectRoot = process.cwd();

type CompileResult = {
  css: string;
  error: string | null;
};

function compileScss(content: string): CompileResult {
  try {
    const result = compileString(content, {
      loadPaths: [
        path.join(projectRoot, 'frontend', 'styles'),
        path.join(projectRoot, 'frontend', 'styles', 'tools'),
        path.join(projectRoot, 'frontend', 'styles', 'settings'),
      ],
      style: 'expanded',
      sourceMap: false,
    });
    return {
      css: result.css.toString(),
      error: null,
    };
  } catch (error) {
    return {
      css: '',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function createTestScss(content: string): string {
  const imports = `@use "functions" as fn;
@use "mixins" as m;
@use "settings/colors" as *;
@use "settings/opacity" as *;
@use "settings/typography" as *;
@use "settings/tokens" as *;
`;

  return `${imports}
.test-element {
  ${content}
}
`;
}

// Test map-get-strict function
await test('map-get-strict: valid map and string key returns value', () => {
  // Valid map and string key
  const scss = createTestScss(
    '$result: fn.map-get-strict((key1: "value1", key2: "value2"), "key1");'
  );
  const { error } = compileScss(scss);
  assert.ifError(error);
  // If we get here, the function worked correctly
});

await test('map-get-strict: rejects non-map first argument', () => {
  const scss = createTestScss('$result: fn.map-get-strict("not-a-map", "key");');
  const { error } = compileScss(scss);
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /map-get-strict\(\): '\$map' must be a Sass map, got string./);
});

await test('map-get-strict: non-string key throws error', () => {
  const scss = createTestScss('$map: (key1: "value1"); $result: fn.map-get-strict($map, 123);');
  const { error } = compileScss(scss);
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /map-get-strict\(\): token key must be a string, got number./);
});

await test('map-get-strict: missing key throws error with available keys', () => {
  const scss = createTestScss('$result: fn.map-get-strict((key1: "value1"), "bogus");');
  const { error } = compileScss(scss);
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /map-get-strict\(\): Key "bogus" not found in \$map\. Available keys: key1/);
});

// Test shadow-border function
await test('shadow-border: accepts valid states', () => {
  const scss = createTestScss('$result: fn.shadow-border(default);');
  let { error } = compileScss(scss);
  assert.ifError(error);

  const scssHover = createTestScss('$result: fn.shadow-border(hover);');
  ({ error } = compileScss(scssHover));
  assert.ifError(error);

  // No-argument call must default to 'default' state
  const scssDefault = createTestScss('$result: fn.shadow-border();');
  ({ error } = compileScss(scssDefault));
  assert.ifError(error);
});

await test('shadow-border: rejects invalid state', () => {
  const scss = createTestScss('$result: fn.shadow-border(invalid);');
  const { error } = compileScss(scss);
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /shadow-border\(\): 'invalid' must be 'default' or 'hover', got invalid./);
});

// Test shadow-border mixin
await test('shadow-border mixin: accepts valid states and rejects invalid ones', () => {
  const valid = createTestScss('@include m.shadow-border;');
  let { error } = compileScss(valid);
  assert.ifError(error);

  const validHover = createTestScss('@include m.shadow-border("hover");');
  ({ error } = compileScss(validHover));
  assert.ifError(error);

  const invalid = createTestScss('@include m.shadow-border("invalid");');
  ({ error } = compileScss(invalid));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /shadow-border\(\): 'invalid' must be 'default' or 'hover', got invalid./);
});

// Test emit-type-scale-tokens mixin
await test('emit-type-scale-tokens: validates map argument', () => {
  const valid = createTestScss('@include m.emit-type-scale-tokens((s: 1rem, l: 2rem));');
  let { css, error } = compileScss(valid);
  assert.ifError(error);
  assert.match(css, /--type-s: 1rem/);

  const invalid = createTestScss('@include m.emit-type-scale-tokens(42);');
  ({ css, error } = compileScss(invalid));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$scale-map' must be a map, got number/);
});

// Test restored utilities (rem, strip-unit, gray, font-stack)
await test('restored utilities: rem, strip-unit, gray, font-stack compile', () => {
  const validCases = [
    'fn.rem(16px)',
    'fn.strip-unit(16px)',
    'fn.gray("500")',
    'fn.font-stack("Arial", ("Helvetica", "sans-serif"))',
  ];
  for (const call of validCases) {
    const { error } = compileScss(createTestScss(`$result: ${call};`));
    assert.ifError(error);
  }
});

// Test token-get function
await test('token-get: validates inputs correctly', () => {
  // Valid inputs
  const scss = createTestScss('$map: (key1: "value1"); $result: fn.token-get($map, "key1");');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid map
  const scssBadMap = createTestScss('$result: fn.token-get("not-a-map", "key");');
  ({ error } = compileScss(scssBadMap));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /map-get-strict\(\): '\$map' must be a Sass map, got string./);

  // Missing key reports the map name and available keys (via map-get-strict)
  const scssMissingKey = createTestScss('$result: fn.token-get((key1: "value1"), "bogus");');
  ({ error } = compileScss(scssMissingKey));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /map-get-strict\(\): Key "bogus" not found in \$map\. Available keys: key1/);

  // Invalid type argument
  const scssBadType = createTestScss('$result: fn.token-get((key1: "value1"), "key1", 123);');
  ({ error } = compileScss(scssBadType));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$type' must be a string, got number/);

  // Falsy type arguments are validated too — no silent skip
  for (const badType of ['false', "''"]) {
    const scssFalsyType = createTestScss(
      `$result: fn.token-get((key1: "value1"), "key1", ${badType});`
    );
    ({ error } = compileScss(scssFalsyType));
    assert.ok(error, `Expected Sass error for $type ${badType} but got none`);
  }

  // Valid type argument
  const scssGoodType = createTestScss('$result: fn.token-get((key1: "value1"), "key1", "string");');
  ({ error } = compileScss(scssGoodType));
  assert.ifError(error);
});

// Test token accessors — shared validation via map-get-strict
await test('token accessors: spacing/radius/elevation/breakpoint reject unknown keys', () => {
  const validCases = [
    'fn.spacing("2")',
    'fn.radius("sm")',
    'fn.elevation("2")',
    'fn.breakpoint("md")',
  ];
  for (const call of validCases) {
    const { error } = compileScss(createTestScss(`$result: ${call};`));
    assert.ifError(error);
  }

  /**
   * @type {Array<[string, RegExp]>}
   */
  const invalidCases: Array<[string, RegExp]> = [
    ['fn.spacing("bogus")', /map-get-strict\(\): Key "bogus" not found in \$spacing\./],
    ['fn.radius("bogus")', /map-get-strict\(\): Key "bogus" not found in \$radius\./],
    ['fn.elevation("bogus")', /map-get-strict\(\): Key "bogus" not found in \$elevation\./],
    ['fn.breakpoint("bogus")', /map-get-strict\(\): Key "bogus" not found in \$breakpoints\./],
  ];
  for (const [call, regex] of invalidCases) {
    const { error } = compileScss(createTestScss(`$result: ${call};`));
    assert.ok(error, `Expected Sass error for ${call} but got none`);
    assert.match(error, regex);
  }

  // null $map must resolve to the global $breakpoints (regression guard)
  const nullMap = compileScss(createTestScss('$result: fn.breakpoint("md", null);'));
  assert.ifError(nullMap.error);

  // Custom map: valid key resolves against it
  const customMap = compileScss(
    createTestScss('width: fn.breakpoint("sm", (sm: 100px, md: 200px));')
  );
  assert.ifError(customMap.error);
  assert.match(customMap.css, /width: 100px/);

  // Custom map: unknown key reports the custom map, not $breakpoints
  const customMapBad = compileScss(createTestScss('$result: fn.breakpoint("bogus", (sm: 100px));'));
  assert.ok(customMapBad.error, 'Expected Sass error but got none');
  assert.match(customMapBad.error, /Key "bogus" not found in \$map\./);

  // Empty map must not fall back to the global map (only null does)
  const emptyMap = compileScss(createTestScss('$result: fn.breakpoint("md", ());'));
  assert.ok(emptyMap.error, 'Expected Sass error but got none');
  assert.match(emptyMap.error, /breakpoint\(\): '\$map' must be a non-empty map, got an empty one/);
});

// Test button-variant mixin
await test('button-variant: validates all parameters', () => {
  // Valid usage
  const scss = createTestScss('@include m.button-variant("color-base");');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid base-css-var (not string)
  const scssBadBase = createTestScss('@include m.button-variant(123);');
  ({ error } = compileScss(scssBadBase));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$base-css-var' must be a string, got number/);

  // Invalid alpha (out of range)
  const scssBadAlpha = createTestScss('@include m.button-variant("color-base", 1.5);');
  ({ error } = compileScss(scssBadAlpha));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /button-variant\(\): 'border-alpha' must be between 0 and 1, got 1\.5/);

  // Invalid alpha (wrong type)
  const scssBadAlphaType = createTestScss('@include m.button-variant("color-base", "invalid");');
  ({ error } = compileScss(scssBadAlphaType));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(
    error,
    /button-variant\(\): 'border-alpha' must be a number between 0 and 1, got string/
  );
});

// Test truncate-lines mixin
await test('truncate-lines: validates line count', () => {
  // Valid value
  const scss = createTestScss('@include m.truncate-lines(2);');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid values
  const scssZero = createTestScss('@include m.truncate-lines(0);');
  ({ error } = compileScss(scssZero));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$lines' must be greater than or equal to 1, got 0./);

  const scssNegative = createTestScss('@include m.truncate-lines(-1);');
  ({ error } = compileScss(scssNegative));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$lines' must be greater than or equal to 1, got -1./);

  const scssFraction = createTestScss('@include m.truncate-lines(1.5);');
  ({ error } = compileScss(scssFraction));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$lines' must be an integer, got 1\.5/);
});

// Test aspect-ratio mixin
await test('aspect-ratio: validates dimensions', () => {
  // Valid values
  const scss = createTestScss('@include m.aspect-ratio(16, 9);');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid width
  const scssBadWidth = createTestScss('@include m.aspect-ratio(-2, 3);');
  ({ error } = compileScss(scssBadWidth));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$width' must be greater than 0, got -2./);

  const scssZeroWidth = createTestScss('@include m.aspect-ratio(0, 3);');
  ({ error } = compileScss(scssZeroWidth));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$width' must be greater than 0, got 0./);

  const scssWithUnit = createTestScss('@include m.aspect-ratio(2px, 3);');
  ({ error } = compileScss(scssWithUnit));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$width' must be a unitless number, got 2px/);
});

// Test elevation-shadow mixin
await test('elevation-shadow: validates level and color', () => {
  // Valid level
  const scss = createTestScss('@include m.elevation-shadow("2");');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid level
  const scssBadLevel = createTestScss('@include m.elevation-shadow("invalid-level");');
  ({ error } = compileScss(scssBadLevel));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /elevation-shadow\(\): 'invalid-level' is not a valid elevation token\./);

  // Invalid level type (non-string)
  const scssBadLevelType = createTestScss('@include m.elevation-shadow(123);');
  ({ error } = compileScss(scssBadLevelType));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /elevation-shadow\(\): '123' is not a valid elevation token\./);

  // Invalid color type
  const scssBadColor = createTestScss('@include m.elevation-shadow("2", 123);');
  ({ error } = compileScss(scssBadColor));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$color' must be a string, got number/);

  // Empty color would produce invalid rgba() CSS
  const scssEmptyColor = createTestScss('@include m.elevation-shadow("2", "");');
  ({ error } = compileScss(scssEmptyColor));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$color' must be a non-empty string/);
});

// Test elevation mixin
await test('elevation mixin: rejects unknown tokens', () => {
  // Valid level
  const scss = createTestScss('@include m.elevation("2");');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid level
  const scssBadLevel = createTestScss('@include m.elevation("bogus");');
  ({ error } = compileScss(scssBadLevel));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Key "bogus" not found in \$elevation/);
});

// Test radius mixin and radius-corners
await test('radius mixin: rejects unknown tokens', () => {
  // Valid token
  const scss = createTestScss('@include m.radius("sm");');
  let { css, error } = compileScss(scss);
  assert.ifError(error);
  // Intentional: asserts the mixin emits the token's actual CSS value;
  // this is the one assertion coupled to $radius contents on purpose.
  assert.match(css, /border-radius: 0\.25rem/);

  // Invalid token
  const scssBad = createTestScss('@include m.radius("bogus");');
  ({ css, error } = compileScss(scssBad));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /radius\(\): 'bogus' is not a valid radius token\./);
});

await test('radius-corners: rejects unknown tokens', () => {
  // Valid tokens
  const scss = createTestScss('@include m.radius-corners("lg", "lg", "none", "none");');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid token in one corner
  const scssBad = createTestScss('@include m.radius-corners("bogus", "lg", "none", "none");');
  ({ error } = compileScss(scssBad));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Key "bogus" not found in \$radius/);
});

// Test icon-padding-adjust mixin
await test('icon-padding-adjust: validates parameters', () => {
  // Valid values
  const scss = createTestScss('@include m.icon-padding-adjust("end", "sm");');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid side
  const scssBadSide = createTestScss('@include m.icon-padding-adjust("middle", "sm");');
  ({ error } = compileScss(scssBadSide));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$side' must be one of start, end, got middle/);

  // Invalid size
  const scssBadSize = createTestScss('@include m.icon-padding-adjust("end", "invalid-size");');
  ({ error } = compileScss(scssBadSize));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(
    error,
    /icon-padding-adjust\(\): 'invalid-size' is not a valid optical-adjustment token\./
  );
});

// Test concentric-radius mixin
await test('concentric-radius: validates padding', () => {
  // Valid value (including zero)
  const scss = createTestScss('@include m.concentric-radius("md", 0);');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Negative value
  const scssNegative = createTestScss('@include m.concentric-radius("md", -5);');
  ({ error } = compileScss(scssNegative));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$padding' must be greater than or equal to 0, got -5/);

  // Invalid radius token
  const scssBadToken = createTestScss('@include m.concentric-radius("bogus", 4px);');
  ({ error } = compileScss(scssBadToken));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Key "bogus" not found in \$radius/);
});

// Test font-face mixin
await test('font-face: validates all parameters', () => {
  // Valid parameters
  const scss = createTestScss('@include m.font-face("TestFont", "/path/to/font", 400);');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Empty name
  const scssEmptyName = createTestScss('@include m.font-face("", "/path/to/font", 400);');
  ({ error } = compileScss(scssEmptyName));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$name' must be a non-empty string/);

  // Empty path
  const scssEmptyPath = createTestScss('@include m.font-face("TestFont", "", 400);');
  ({ error } = compileScss(scssEmptyPath));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$path' must be a non-empty string/);

  // Invalid weight
  const scssBadWeight = createTestScss('@include m.font-face("TestFont", "/path/to/font", -1);');
  ({ error } = compileScss(scssBadWeight));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$weight' must be greater than or equal to 1, got -1/);

  // Invalid style type
  const scssBadStyle = createTestScss(
    '@include m.font-face("TestFont", "/path/to/font", 400, 123);'
  );
  ({ error } = compileScss(scssBadStyle));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$style' must be a string, got number/);
});

// Test transition mixin
await test('transition: validates parameters', () => {
  // Valid parameters
  const scss = createTestScss('@include m.transition(background-color, 0.2s, ease-out);');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid property (not string)
  const scssBadProp = createTestScss('@include m.transition(123, 0.2s);');
  ({ error } = compileScss(scssBadProp));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$property' must be a string, got number/);

  // Invalid duration (not a number)
  const scssBadDurType = createTestScss('@include m.transition(background-color, "fast");');
  ({ error } = compileScss(scssBadDurType));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /transition\(\): '\$duration' must be a non-negative time value, got fast/);

  // Invalid duration (negative)
  const scssBadDur = createTestScss('@include m.transition(background-color, -0.1s);');
  ({ error } = compileScss(scssBadDur));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /transition\(\): '\$duration' must be a non-negative time value/);

  // Invalid duration (unitless zero — duration requires a time unit)
  const scssUnitlessZero = createTestScss('@include m.transition(background-color, 0);');
  ({ error } = compileScss(scssUnitlessZero));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(
    error,
    /transition\(\): '\$duration' must be a time value with unit 's' or 'ms', got 0/
  );

  // Invalid duration (wrong unit)
  const scssWrongUnit = createTestScss('@include m.transition(background-color, 10px);');
  ({ error } = compileScss(scssWrongUnit));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(
    error,
    /transition\(\): '\$duration' must be a time value with unit 's' or 'ms', got 10px/
  );

  // Valid durations: zero with time unit, s and ms
  for (const duration of ['0s', '0ms', '150ms']) {
    const scssValid = createTestScss(`@include m.transition(background-color, ${duration});`);
    ({ error } = compileScss(scssValid));
    assert.ifError(error);
  }

  // Invalid easing (not string)
  const scssBadEase = createTestScss('@include m.transition(background-color, 0.2s, 123);');
  ({ error } = compileScss(scssBadEase));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$easing' must be a string, got number/);
});

// Test respond-to-all mixin
await test('respond-to-all: validates breakpoint map', () => {
  // Valid map
  const scss = createTestScss('@include m.respond-to-all((sm: 576px, md: 768px)) { color: red; }');
  let { css, error } = compileScss(scss);
  assert.ifError(error);
  // Check that media queries were generated
  assert.match(css, /@media screen and \(min-width: 576px\)/);
  assert.match(css, /@media screen and \(min-width: 768px\)/);

  // Invalid (not a map)
  const scssNotMap = createTestScss('@include m.respond-to-all("not-a-map") { color: red; }');
  ({ css, error } = compileScss(scssNotMap));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$breakpoints' must be a map, got string/);
});

// Test respond-to / respond-below mixins
await test('respond-to / respond-below: reject unknown breakpoints', () => {
  // Valid breakpoint
  const scss = createTestScss('@include m.respond-to("md") { color: red; }');
  let { css, error } = compileScss(scss);
  assert.ifError(error);
  // Intentional: verifies the media query resolves against the real
  // $breakpoints contents (coupled on purpose, like the radius assertion).
  assert.match(css, /@media screen and \(min-width: 990px\)/);

  // Invalid breakpoint
  const scssBad = createTestScss('@include m.respond-to("bogus") { color: red; }');
  ({ css, error } = compileScss(scssBad));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Key "bogus" not found in \$breakpoints/);

  // Invalid breakpoint for respond-below
  const scssBadBelow = createTestScss('@include m.respond-below("bogus") { color: red; }');
  ({ css, error } = compileScss(scssBadBelow));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Key "bogus" not found in \$breakpoints/);
});

// Test spacing-utility mixin
await test('spacing-utility: validates parameters', () => {
  // Valid parameters
  const scss = createTestScss('@include m.spacing-utility("u-m-", "margin");');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Empty prefix
  const scssEmptyPrefix = createTestScss('@include m.spacing-utility("", "margin");');
  ({ error } = compileScss(scssEmptyPrefix));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$prefix' must be a non-empty string/);

  // Invalid property
  const scssBadProp = createTestScss('@include m.spacing-utility("u-m-", "border");');
  ({ error } = compileScss(scssBadProp));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(
    error,
    /spacing-utility\(\): '\$property' must be 'margin' or 'padding', got border/
  );
});

// Test hover-active-pressed and active-pressed (they share similar validation via prefix)
await test('hover-active-pressed: validates prefix parameter', () => {
  // No-argument call must default to 'btn' (original .btn--pressed selector)
  const scssDefault = createTestScss('@include m.hover-active-pressed { color: red; }');
  let { css, error } = compileScss(scssDefault);
  assert.ifError(error);
  assert.match(css, /\.btn--pressed/);

  // Valid prefix
  const scss = createTestScss('@include m.hover-active-pressed("test-prefix") { color: red; }');
  ({ css, error } = compileScss(scss));
  assert.ifError(error);
  assert.match(css, /\.test-prefix--pressed/);

  // Invalid prefix (non-string)
  const scssBadPrefix = createTestScss('@include m.hover-active-pressed(123) { color: red; }');
  ({ css, error } = compileScss(scssBadPrefix));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$prefix' must be a string, got number/);

  // Empty prefix
  const scssEmptyPrefix = createTestScss('@include m.hover-active-pressed("") { color: red; }');
  ({ css, error } = compileScss(scssEmptyPrefix));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$prefix' must be a non-empty string/);
});

await test('active-pressed: validates prefix parameter', () => {
  // Valid prefix
  const scss = createTestScss('@include m.active-pressed("test-prefix") { color: red; }');
  let { error } = compileScss(scss);
  assert.ifError(error);

  // Invalid (non-string)
  const scssBadPrefix = createTestScss('@include m.active-pressed(123) { color: red; }');
  ({ error } = compileScss(scssBadPrefix));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$prefix' must be a string, got number/);

  // Empty prefix
  const scssEmptyPrefix = createTestScss('@include m.active-pressed("") { color: red; }');
  ({ error } = compileScss(scssEmptyPrefix));
  assert.ok(error, 'Expected Sass error but got none');
  assert.match(error, /Invalid argument: '\$prefix' must be a non-empty string/);
});
