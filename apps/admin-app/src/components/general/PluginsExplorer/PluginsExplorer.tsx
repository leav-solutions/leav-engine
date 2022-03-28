// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {getPluginsQuery} from 'queries/plugins/getPluginsQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {GET_ALL_PLUGINS} from '_gqlTypes/GET_ALL_PLUGINS';
import PluginsList from './PluginsList';

const PluginsExplorer = (): JSX.Element => {
    const {t} = useTranslation();
    const {loading, error, data} = useQuery<GET_ALL_PLUGINS>(getPluginsQuery);

    return (
        <>
            {error && <ErrorDisplay message={error.message} />}
            {!error && <PluginsList loading={loading || !data} plugins={data?.plugins ?? []} />}
        </>
    );
};

export default PluginsExplorer;
