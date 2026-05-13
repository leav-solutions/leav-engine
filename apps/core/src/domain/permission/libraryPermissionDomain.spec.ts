import {type IQueryInfos} from '../../_types/queryInfos';
import {LibraryPermissionsActions} from '../../_types/permissions';
import {type IGlobalPermissionHelper} from './helpers/globalPermission';
import libraryPermissionDomain from './libraryPermissionDomain';

describe('LibraryPermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest',
    };
    const globalPerm = false;
    const inheritGlobalPerm = true;

    const mockGlobalPermHelper: Mockify<IGlobalPermissionHelper> = {
        getGlobalPermission: global.__mockPromise(globalPerm),
        getInheritedGlobalPermission: global.__mockPromise(inheritGlobalPerm),
    };

    describe('getLibraryPermission', () => {
        test('Return library permission', async () => {
            const permDomain = libraryPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper,
            });

            const perm = await permDomain.getLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_tree',
                ctx,
            });

            expect(perm).toBe(globalPerm);
        });
    });

    describe('getInheritedLibraryPermission', () => {
        test('Return herited library permission', async () => {
            const permDomain = libraryPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper,
            });

            const perm = await permDomain.getInheritedLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_tree',
                userGroupId: '12345',
                ctx,
            });

            expect(perm).toBe(inheritGlobalPerm);
        });
    });
});
