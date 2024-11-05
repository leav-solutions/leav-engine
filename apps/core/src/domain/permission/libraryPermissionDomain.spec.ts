// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {LibraryPermissionsActions} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import libraryPermissionDomain from './libraryPermissionDomain';

describe('LibraryPermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };
    const globalPerm = false;
    const inheritGlobalPerm = true;

    const mockGlobalPermHelper: Mockify<IGlobalPermissionHelper> = {
        getGlobalPermission: global.__mockPromise(globalPerm),
        getInheritedGlobalPermission: global.__mockPromise(inheritGlobalPerm)
    };

    describe('getLibraryPermission', () => {
        test('Return library permission', async () => {
            const permDomain = libraryPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_tree',
                userId: '12345',
                ctx
            });

            expect(perm).toBe(globalPerm);
        });
    });

    describe('getInheritedLibraryPermission', () => {
        test('Return herited library permission', async () => {
            const permDomain = libraryPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getInheritedLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_tree',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(inheritGlobalPerm);
        });
    });
});
