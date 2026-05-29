import {isValidUuidV4} from './validateUuid';

describe('validateUuid', () => {
    describe('isValidUuidV4', () => {
        test('returns true for a canonical UUID v4', () => {
            expect(isValidUuidV4('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
        });

        test('accepts uppercase hex characters', () => {
            expect(isValidUuidV4('F47AC10B-58CC-4372-A567-0E02B2C3D479')).toBe(true);
        });

        test('returns false for a UUID v1', () => {
            expect(isValidUuidV4('f47ac10b-58cc-1372-a567-0e02b2c3d479')).toBe(false);
        });

        test('returns false for empty string', () => {
            expect(isValidUuidV4('')).toBe(false);
        });

        test('returns false for non-UUID string', () => {
            expect(isValidUuidV4('not-a-uuid')).toBe(false);
        });

        test('returns false when the variant nibble is out of range', () => {
            expect(isValidUuidV4('f47ac10b-58cc-4372-c567-0e02b2c3d479')).toBe(false);
        });

        test('returns false on extra characters', () => {
            expect(isValidUuidV4('f47ac10b-58cc-4372-a567-0e02b2c3d479X')).toBe(false);
        });
    });
});
