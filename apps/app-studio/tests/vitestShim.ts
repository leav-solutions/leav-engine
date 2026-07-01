/*
 * TRANSITIONAL SHIM — remove once app-studio is migrated to Vitest.
 *
 * app-studio still runs on Jest but consumes @leav/ui test helpers from source
 * (e.g. _tests/testUtils.tsx), which now import from 'vitest'. Under Jest that import
 * becomes require('vitest') and crashes ("Vitest cannot be imported in a CommonJS module").
 * jest.config.js maps '^vitest$' to this shim so those imports resolve to the Jest API instead.
 * The `vi` and `jest` APIs overlap for what the shared helpers use (spyOn, mock…).
 */
export const vi = jest;
