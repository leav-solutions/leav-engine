// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header} from 'semantic-ui-react';
import {PermissionTypes} from '../../../_gqlTypes/globalTypes';
import DefinePermByUserGroupView from '../DefinePermByUserGroupView/DefinePermByUserGroupView';

const AppPermissions = (): JSX.Element => {
    const {t} = useTranslation();

    return (
        <>
            <Header className="no-grow">{t('permissions.title')}</Header>
            <DefinePermByUserGroupView type={PermissionTypes.app} />
        </>
    );
};

export default AppPermissions;
