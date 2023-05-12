// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Icon} from 'semantic-ui-react';

const ForbiddenRoute = (): JSX.Element => {
    const {t} = useTranslation();
    return (
        <h3>
            <Icon name="ban" />
            {t('admin.forbidden_route')}
        </h3>
    );
};

export default ForbiddenRoute;
