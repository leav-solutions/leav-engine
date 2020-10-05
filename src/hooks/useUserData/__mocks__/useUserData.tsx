import {PermissionsActions} from '../../../_gqlTypes/globalTypes';

export default () => {
    return {
        id: 1,
        name: 'Test',
        permissions: Object.values(PermissionsActions)
            .filter(a => !!a.match(/^app_/))
            .reduce((perms, p) => {
                perms[p] = true;

                return perms;
            }, {})
    };
};
