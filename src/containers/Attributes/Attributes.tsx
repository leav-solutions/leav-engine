import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Header, Icon} from 'semantic-ui-react';

interface IAttributesProps {
    t: TranslationFunction;
}

function Attributes({t}: IAttributesProps) {
    return (
        <Header size="large">
            <Icon name="edit outline" />
            {t('attributes.title')}
        </Header>
    );
}

export default translate()(Attributes);
