// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import PluginsExplorer from 'components/general/PluginsExplorer';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {useTranslation} from 'react-i18next';
import {List} from 'semantic-ui-react';
import {PermissionsActions, useGetVersionQuery} from '_gqlTypes';
import useUserData from '../../../../hooks/useUserData';

function GeneralInfosTab(): JSX.Element {
    const {loading, error, data} = useGetVersionQuery();
    const userData = useUserData();
    const {t} = useTranslation();

    // If version starts with a number, add a v in front of it
    let version = data?.version;
    if (version && !isNaN(parseInt(version[0], 10))) {
        version = 'v' + version;
    }

    return (
        <List divided relaxed>
            <List.Item>
                <List.Icon name="cogs" />
                <List.Content>
                    {loading && <Loading />}
                    {error && <ErrorDisplay message={error.message} />}
                    {data && <span>{t('general.version', {version})}</span>}
                </List.Content>
            </List.Item>
            {userData.permissions[PermissionsActions.admin_list_plugins] && (
                <List.Item>
                    <List.Icon name="puzzle piece" />
                    <List.Content>
                        <List.Header>{t('plugins.title')}</List.Header>
                        <PluginsExplorer />
                    </List.Content>
                </List.Item>
            )}
        </List>
    );
}

export default GeneralInfosTab;
