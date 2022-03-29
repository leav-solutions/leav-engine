"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const _1 = require(".");
describe('useAuthToken', () => {
    test('Save, get and delete token', async () => {
        const { getToken, saveToken, deleteToken } = _1.useAuthToken();
        const token = 'fake-token';
        saveToken(token);
        expect(getToken()).toBe(token);
        deleteToken();
        expect(getToken()).toBe('');
    });
});
//# sourceMappingURL=useAuthToken.test.js.map