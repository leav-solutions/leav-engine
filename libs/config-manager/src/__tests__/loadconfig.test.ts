// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
