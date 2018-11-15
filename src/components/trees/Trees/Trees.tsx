import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Header, Icon} from 'semantic-ui-react';

function Trees({t}: WithNamespaces) {
    return (
        <Header size="large">
            <Icon name="share alternate" />
            {t('trees.title')}
        </Header>
    );
}

export default withNamespaces()(Trees);
