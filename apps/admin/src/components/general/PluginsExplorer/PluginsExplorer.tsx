// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {useTranslation} from 'react-i18next';
import {type GET_ALL_PLUGINS_plugins} from '_gqlTypes/GET_ALL_PLUGINS';
import PluginsList from './PluginsList';
import {useGetAllPluginsQuery} from '_gqlTypes';

const PluginsExplorer = (): JSX.Element => {
    const {t} = useTranslation();
    const {loading, error, data} = useGetAllPluginsQuery();

    return (
        <>
            {error && <ErrorDisplay message={error.message} />}
            {!error && (
                <PluginsList loading={loading || !data} plugins={(data?.plugins as GET_ALL_PLUGINS_plugins[]) ?? []} />
            )}
        </>
    );
};

export default PluginsExplorer;
