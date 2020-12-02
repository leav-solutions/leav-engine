// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import maskValueAction from './maskValueAction';

describe('maskValue', () => {
    const action = maskValueAction().action;
    test('maskValue', async () => {
        expect(action('coucou', null, null)).toBe('●●●●●●●');
        expect(action(13456, null, null)).toBe('●●●●●●●');
        expect(action({toto: 'tata'}, null, null)).toBe('●●●●●●●');

        expect(action('', null, null)).toBe('');
        expect(action(null, null, null)).toBe('');
        expect(action({}, null, null)).toBe('');
    });
});
