import {TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import {Loader} from 'semantic-ui-react';

interface ILoadingProps {
    t: TranslationFunction;
}

function Loading({t}: ILoadingProps): JSX.Element {
    return (
        <Loader active inline="centered">
            {t('admin.loading')}
        </Loader>
    );
}

export default translate()(Loading);
