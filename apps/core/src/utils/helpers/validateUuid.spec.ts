import {isValidUuid} from './validateUuid';

describe('validateUuid', () => {
    describe('isValidUuid', () => {
        test('accepts a UUID', () => {
            expect(isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
        });

        test('accepts uppercase hex characters', () => {
            expect(isValidUuid('F47AC10B-58CC-4372-A567-0E02B2C3D479')).toBe(true);
        });

        test('rejects an empty string', () => {
            expect(isValidUuid('')).toBe(false);
        });

        test('rejects a non-UUID string', () => {
            expect(isValidUuid('not-a-uuid')).toBe(false);
        });

        test('rejects a string with extra characters', () => {
            expect(isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479X')).toBe(false);
        });

        test('rejects a string with missing hyphens', () => {
            expect(isValidUuid('f47ac10b58cc4372a5670e02b2c3d479')).toBe(false);
        });
    });
});
