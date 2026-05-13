import {PermissionsActions} from '../../../_gqlTypes';

const mockUseUserData = () => ({
    id: 1,
    name: 'Test',
    permissions: Object.values(PermissionsActions)
        .filter(a => !!a.match(/^admin_/))
        .reduce((perms, p) => {
            perms[p] = true;

            return perms;
        }, {}),
});

export default mockUseUserData;
