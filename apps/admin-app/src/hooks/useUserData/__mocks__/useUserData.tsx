// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';

const mockUseUserData = () => {
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

export default mockUseUserData;
