import {loadConfig} from '../index';

describe('loadConfig', () => {
    test('Should load config with overrides', async () => {
        const conf = await loadConfig(__dirname + '/fixtures', 'dev');

        expect(conf).toEqual({
            toto: 'otot',
            atat: 'toto',
            tutu: {
                titi: {
                    tyty: 42,
                    utut: [3, 4]
                }
            },
            env: 'dev'
        });
    });
});
