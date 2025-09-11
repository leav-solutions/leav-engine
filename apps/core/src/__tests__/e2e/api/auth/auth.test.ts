// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios from 'axios';
import {getConfig} from '../../../../config';
import {makeGraphQlCall, getGraphQLUrl} from '../e2eUtils';
import {ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME} from '../../../../_types/auth';

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
    });

    test('Me', async () => {
        const res = await makeGraphQlCall(`{
            me {
                id
                login: property(attribute: "login") {
                    ...on Value {
                        payload
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.me.id).toBeTruthy();
        expect(res.data.data.me.login[0].payload).toBeTruthy();
    });

    test('validateRequestToken rotates tokens when using only refreshToken', async () => {
        const conf = await getConfig();
        const urlAuthenticate = `http://${conf.server.host}:${conf.server.port}/auth/authenticate`;

        const headers = {
            'user-agent': 'jest-e2e',
            'x-forwarded-for': '127.0.0.1'
        };

        const resAuthenticate = await axios.post(
            urlAuthenticate,
            {
                login: 'admin',
                password: 'admin'
            },
            {headers}
        );

        expect(resAuthenticate.status).toBe(200);
        const setCookies = resAuthenticate.headers['set-cookie'] as string[];
        expect(setCookies).toBeTruthy();

        const cookieMap: Record<string, string> = {};
        for (const c of setCookies) {
            const [pair] = c.split(';');
            const [name, value] = pair.split('=');
            cookieMap[name] = value;
        }

        const initialAccess = cookieMap[ACCESS_TOKEN_COOKIE_NAME];
        const initialRefresh = cookieMap[REFRESH_TOKEN_COOKIE_NAME];
        expect(initialAccess).toBeTruthy();
        expect(initialRefresh).toBeTruthy();

        // Now call GraphQL with only the refresh token to trigger rotation
        const graphQlUrl = await getGraphQLUrl();
        const query = `{
            me { id }
        }`;

        const resGql = await axios.post(
            graphQlUrl,
            {query},
            {
                headers: {
                    ...headers,
                    Cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${initialRefresh}`
                },
                validateStatus: () => true
            }
        );

        expect(resGql.status).toBe(200);

        const rotatedCookies = resGql.headers['set-cookie'] as string[];
        expect(rotatedCookies).toBeTruthy();
        const rotatedMap: Record<string, string> = {};
        for (const c of rotatedCookies) {
            const [pair] = c.split(';');
            const [name, value] = pair.split('=');
            rotatedMap[name] = value;
        }
        expect(rotatedMap[ACCESS_TOKEN_COOKIE_NAME]).toBeTruthy();
        expect(rotatedMap[REFRESH_TOKEN_COOKIE_NAME]).toBeTruthy();
        expect(rotatedMap[REFRESH_TOKEN_COOKIE_NAME]).not.toEqual(initialRefresh);
    });
});
