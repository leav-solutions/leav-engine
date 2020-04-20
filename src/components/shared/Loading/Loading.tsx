import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimmer, Loader} from 'semantic-ui-react';

interface ILoadingProps {
    withDimmer?: boolean;
}

/* tslint:disable-next-line:variable-name */
const Loading = ({withDimmer}: ILoadingProps): JSX.Element => {
    const {t} = useTranslation();
    const loader = (
        <Loader active inline="centered">
            {t('admin.loading')}
        </Loader>
    );

    return withDimmer ? (
        <Dimmer active inverted>
            {loader}
        </Dimmer>
    ) : (
        loader
    );
};

Loading.defaultProps = {
    withDimmer: false
};

export default Loading;
