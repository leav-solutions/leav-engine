// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios from 'axios';
import {getConfig} from '../../../../config';
import {makeGraphQlCall} from '../e2eUtils';

describe('Auth', () => {
    test('Authenticate and refresh', async () => {
        // Authenticate

        const conf = await getConfig();
        const urlAuthenticate = `http://${conf.server.host}:${conf.server.port}/auth/authenticate`;

        const resAuthenticate = await axios.post(urlAuthenticate, {
            login: 'admin',
            password: 'admin'
        });

        expect(resAuthenticate.status).toBe(200);
        expect(resAuthenticate.data.refreshToken).toBeTruthy();
    });

    test('Me', async () => {
        const res = await makeGraphQlCall(`{
            me {
                id
                login: property(attribute: "login") {
                    ...on Value {
                        value
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.me.id).toBeTruthy();
        expect(res.data.data.me.login[0].value).toBeTruthy();
    });
});
