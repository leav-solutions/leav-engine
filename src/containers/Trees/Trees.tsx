import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Header, Icon} from 'semantic-ui-react';

interface ITreesProps {
    t: TranslationFunction;
}

function Trees({t}: ITreesProps) {
    return (
        <Header size="large">
            <Icon name="share alternate" />
            {t('trees.title')}
        </Header>
    );
}

export default translate()(Trees);
