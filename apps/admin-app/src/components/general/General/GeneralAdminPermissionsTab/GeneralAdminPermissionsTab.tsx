// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import DefinePermByUserGroupView from 'components/permissions/DefinePermByUserGroupView';
import React from 'react';
import {PermissionTypes} from '_gqlTypes/globalTypes';

function GeneralAdminPermissionsTab(): JSX.Element {
    return <DefinePermByUserGroupView type={PermissionTypes.app} />;
}

export default GeneralAdminPermissionsTab;
