// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import userDataRepo from './userDataRepo';

describe('UserDataRepo', () => {
    const ctx = {
        userId: '1',
        requestId: 'userDataRepoTest'
    };

    test('save user data', async function () {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise([{data: {test: 'value'}}])
        };

        const udr = userDataRepo({
            'core.infra.db.dbService': mockDbServ
        });

        const res = await udr.saveUserData('test', 'value', false, ctx);

        expect(mockDbServ.execute.mock.calls.length).toBe(1);
        expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery

        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPSERT/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/INSERT/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

        expect(res).toEqual({data: {test: 'value'}, global: false});
    });

    test('get user data', async function () {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise([{test: 'data'}])
        };

        const udr = userDataRepo({
            'core.infra.db.dbService': mockDbServ
        });

        const res = await udr.getUserData(['test'], false, ctx);

        expect(mockDbServ.execute.mock.calls.length).toBe(1);
        expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery

        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/FILTER/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

        expect(res).toEqual({global: false, data: {test: 'data'}});
    });
});
