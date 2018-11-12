import {TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import {Dimmer, Loader} from 'semantic-ui-react';

interface ILoadingProps {
    t: TranslationFunction;
    withDimmer?: boolean;
}

function Loading({t, withDimmer}: ILoadingProps): JSX.Element {
    const loader = (
        <Loader active inline="centered">
            {t('admin.loading')}
        </Loader>
    );

    return withDimmer ? (
        <Dimmer active inverted>
            ${loader}
        </Dimmer>
    ) : (
        loader
    );
}

Loading.defaultProps = {
    withDimmer: false
};

export default translate()(Loading);
