// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IUserDataRepo} from 'infra/userData/userDataRepo';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IQueryInfos} from '_types/queryInfos';
import userDataDomain from './userDataDomain';
import PermissionError from '../../errors/PermissionError';

describe('UserDataDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'userDataDomainTest'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('save user data', () => {
        test('should save a user preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true)
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                saveUserData: global.__mockPromise(true)
            };

            const udd = userDataDomain({
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const res = await udd.saveUserData('test1', 1, false, ctx);

            expect(mockUserDataRepo.saveUserData.mock.calls.length).toBe(1);
            expect(res).toBeTruthy();
        });

        test('should save a global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true)
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                saveUserData: global.__mockPromise(true)
            };

            const udd = userDataDomain({
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const res = await udd.saveUserData('test3', 3, true, ctx);

            expect(mockUserDataRepo.saveUserData.mock.calls.length).toBe(1);
            expect(res).toBeTruthy();
        });

        test('should throw on saving global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(false)
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                saveUserData: global.__mockPromise(true)
            };

            const udd = userDataDomain({
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            await expect(udd.saveUserData('test2', 2, true, ctx)).rejects.toThrow(PermissionError);
        });
    });

    describe('get user data', () => {
        test('should get a user preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true)
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                getUserData: global.__mockPromise({global: false, data: {key: 'data'}})
            };

            const udd = userDataDomain({
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const res = await udd.getUserData(['key'], false, ctx);

            expect(mockUserDataRepo.getUserData.mock.calls.length).toBe(1);
            expect(res).toEqual({global: false, data: {key: 'data'}});
        });

        test('should get a global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true)
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                getUserData: global.__mockPromise({global: true, data: {key: 'data'}})
            };

            const udd = userDataDomain({
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const res = await udd.getUserData(['key'], true, ctx);

            expect(mockUserDataRepo.getUserData.mock.calls.length).toBe(1);
            expect(res).toEqual({global: true, data: {key: 'data'}});
        });

        test('should throw on getting global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(false)
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                getUserData: global.__mockPromise({global: true, data: {key: 'data'}})
            };

            const udd = userDataDomain({
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            await expect(udd.getUserData(['key'], true, ctx)).rejects.toThrow(PermissionError);
        });
    });
});
