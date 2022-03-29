// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useAuthToken} from '.';

describe('useAuthToken', () => {
    test('Save, get and delete token', async () => {
        const {getToken, saveToken, deleteToken} = useAuthToken();
        const token = 'fake-token';

        saveToken(token);
        expect(getToken()).toBe(token);

        deleteToken();
        expect(getToken()).toBe('');
    });
});
