// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimmer, Loader, SemanticSIZES} from 'semantic-ui-react';

interface ILoadingProps {
    withDimmer?: boolean;
    size?: SemanticSIZES;
}

const Loading = ({withDimmer, size}: ILoadingProps): JSX.Element => {
    const {t} = useTranslation();
    const loader = (
        <Loader active inline="centered" size={size}>
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

export default Loading;
