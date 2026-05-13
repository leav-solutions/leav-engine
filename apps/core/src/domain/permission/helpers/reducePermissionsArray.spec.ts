import reducePermissionsArray from './reducePermissionsArray';

describe('reducePermissionsArray', () => {
    describe('Extract permission from an array of permissions', () => {
        const {reducePermissionsArray: helperFunc} = reducePermissionsArray();

        test('Only false', async () => {
            expect(helperFunc([false, false, false])).toBe(false);
        });

        test('Only true', async () => {
            expect(helperFunc([true, true, true])).toBe(true);
        });

        test('True and false', async () => {
            expect(helperFunc([true, false, true, true, false])).toBe(true);
        });
    });
});
