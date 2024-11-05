// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';

const mockUseUserData = () => ({
        id: 1,
        name: 'Test',
        permissions: Object.values(PermissionsActions)
            .filter(a => !!a.match(/^admin_/))
            .reduce((perms, p) => {
                perms[p] = true;

                return perms;
            }, {})
    });

export default mockUseUserData;
