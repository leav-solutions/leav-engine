import React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {Icon} from 'semantic-ui-react';

function ForbiddenRoute({t}: WithNamespaces): JSX.Element {
    return (
        <h3>
            <Icon name="ban" />
            {t('admin.forbidden_route')}
        </h3>
    );
}

export default withNamespaces()(ForbiddenRoute);
