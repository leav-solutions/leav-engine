import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimmer, Loader, type SemanticSIZES} from 'semantic-ui-react';

interface ILoadingProps {
    withDimmer?: boolean;
    withLabel?: boolean;
    size?: SemanticSIZES;
    style?: React.CSSProperties;
}

const Loading = ({withDimmer, withLabel = true, size, style}: ILoadingProps): JSX.Element => {
    const {t} = useTranslation();
    const loader = (
        <Loader active inline="centered" size={size} style={style}>
            {withLabel ? t('admin.loading') : null}
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

export default Loading;
