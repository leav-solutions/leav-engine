// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios from 'axios';
import {getConfig} from '../../../../config';
import {makeGraphQlCall} from '../e2eUtils';

describe('Auth', () => {
    test('Authenticate', async () => {
        const conf = await getConfig();
        const url = `http://${conf.server.host}:${conf.server.port}/auth/authenticate`;

        const res = await axios.post(url, {
            login: 'admin',
            password: 'admin'
        });

        expect(res.status).toBe(200);
        expect(res.data.token).toBeTruthy();
    });

    test('Me', async () => {
        const res = await makeGraphQlCall(`{
            me {
                id
                login
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.me.id).toBeTruthy();
        expect(res.data.data.me.login).toBeTruthy();
    });
});
