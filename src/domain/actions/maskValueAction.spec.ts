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
