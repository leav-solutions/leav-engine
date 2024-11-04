// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimmer, Loader, SemanticSIZES} from 'semantic-ui-react';

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
