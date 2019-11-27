import React from 'react';
import {useTranslation} from 'react-i18next';
import {Icon} from 'semantic-ui-react';

/* tslint:disable-next-line:variable-name */
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
