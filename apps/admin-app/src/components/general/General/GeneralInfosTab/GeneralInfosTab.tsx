// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import PluginsExplorer from 'components/general/PluginsExplorer';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {getCoreVersionQuery} from 'queries/version/getVersionQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {List} from 'semantic-ui-react';
import {GET_VERSION} from '_gqlTypes/GET_VERSION';

function GeneralInfosTab(): JSX.Element {
    const {loading, error, data} = useQuery<GET_VERSION>(getCoreVersionQuery);
    const {t} = useTranslation();

    //TODO: get core version, display plugins
    return (
        <List divided relaxed>
            <List.Item>
                <List.Icon name="cogs" />
                <List.Content>
                    {loading && <Loading />}
                    {error && <ErrorDisplay message={error.message} />}
                    {data && <span>{t('general.version', {version: data.version})}</span>}
                </List.Content>
            </List.Item>
            <List.Item>
                <List.Icon name="puzzle piece" />
                <List.Content>
                    <List.Header>{t('plugins.title')}</List.Header>
                    <PluginsExplorer />
                </List.Content>
            </List.Item>
        </List>
    );
}

export default GeneralInfosTab;
