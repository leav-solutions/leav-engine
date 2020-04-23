import {useQuery} from '@apollo/react-hooks';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Grid, Header, Icon} from 'semantic-ui-react';
import {getPluginsQuery} from '../../queries/plugins/getPluginsQuery';
import {GET_ALL_PLUGINS} from '../../_gqlTypes/GET_ALL_PLUGINS';
import PluginsList from './PluginsList';

interface IPluginsExplorerProps {
    history: History;
}

const PluginsExplorer = ({history}: IPluginsExplorerProps): JSX.Element => {
    const {t} = useTranslation();
    const {loading, error, data} = useQuery<GET_ALL_PLUGINS>(getPluginsQuery);

    return (
        <>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="folder outline" />
                        {t('plugins.title')}
                    </Header>
                </Grid.Column>
            </Grid>
            {typeof error !== 'undefined' ? (
                <p>Error: {error.message}</p>
            ) : (
                <PluginsList loading={loading || !data} plugins={data && data.plugins ? data.plugins : []} />
            )}
        </>
    );
};

export default PluginsExplorer;
