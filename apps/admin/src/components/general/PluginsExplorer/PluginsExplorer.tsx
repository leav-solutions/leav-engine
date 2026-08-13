import ErrorDisplay from '../../shared/ErrorDisplay';
import {type GET_ALL_PLUGINS_plugins} from '../../../_gqlTypes/GET_ALL_PLUGINS';
import PluginsList from './PluginsList';
import {useGetAllPluginsQuery} from '../../../_gqlTypes';

const PluginsExplorer = (): JSX.Element => {
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
