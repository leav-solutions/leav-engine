// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery, useSubscription} from '@apollo/client';
import {ErrorDisplay, Loading} from '@leav/ui';
import {APPLICATION_EVENTS, APPLICATION_EVENTSVariables} from '_gqlTypes/APPLICATION_EVENTS';
import {IS_ALLOWED, IS_ALLOWEDVariables} from '_gqlTypes/IS_ALLOWED';
import {PermissionsActions} from '_gqlTypes/globalTypes';
import {Tabs, TabsProps} from 'antd';
import {isAllowedQuery} from 'graphQL/queries/permissions/isAllowedQuery';
import {getApplicationsEventsSubscription} from 'graphQL/subscribes/applications/getApplicationsEventsSubscription';
import {useTranslation} from 'react-i18next';
import {useHistory, useParams, useRouteMatch} from 'react-router-dom';
import {PermissionTypes} from '../../../../../libs/ui/src/_gqlTypes';
import ApplicationSettings from './ApplicationSettings';
import LibrariesSettings from './LibrariesSettings';
import TreesSettings from './TreesSettings';

function Settings(): JSX.Element {
    const {t} = useTranslation();
    useSubscription<APPLICATION_EVENTS, APPLICATION_EVENTSVariables>(getApplicationsEventsSubscription);
    const history = useHistory();
    const urlParams = useParams<{tabId?: string}>();
    const routeMatch = useRouteMatch();

    const {loading: permissionsLoading, error: permissionsError, data: permissionsData} = useQuery<
        IS_ALLOWED,
        IS_ALLOWEDVariables
    >(isAllowedQuery, {
        variables: {
            type: PermissionTypes.admin,
            actions: [PermissionsActions.admin_access_libraries, PermissionsActions.admin_access_trees]
        }
    });
    const canAccessLibraries =
        permissionsData?.isAllowed?.find(p => p.name === PermissionsActions.admin_access_libraries)?.allowed ?? false;
    const canAccessTrees =
        permissionsData?.isAllowed?.find(p => p.name === PermissionsActions.admin_access_trees)?.allowed ?? false;

    const tabsItems: Array<TabsProps['items'][number] & {accessible: boolean}> = [
        {
            key: 'application',
            label: t('app_settings.application'),
            children: <ApplicationSettings />,
            style: {padding: 0},
            accessible: true
        },
        {
            key: 'libraries',
            label: t('app_settings.libraries'),
            children: <LibrariesSettings />,
            style: {padding: 0},
            accessible: canAccessLibraries
        },
        {
            key: 'trees',
            label: t('app_settings.trees'),
            children: <TreesSettings />,
            style: {padding: 0},
            accessible: canAccessTrees
        }
    ].filter(tab => tab.accessible);

    const _handleTabClick = (key: string) => {
        // Extract base path from url: url minus tabId if any
        const basePath = routeMatch?.url.replace(`/${urlParams.tabId}`, '');

        // Add current tab to url
        history.push(`${basePath}/${key}`);
    };

    if (permissionsLoading) {
        return <Loading />;
    }

    if (permissionsError) {
        return <ErrorDisplay message={permissionsError.message} />;
    }

    return (
        <Tabs
            tabPosition="left"
            defaultActiveKey={urlParams.tabId ?? 'application'}
            items={tabsItems}
            style={{height: '100%', overflow: 'auto'}}
            tabBarStyle={{width: 250}}
            onTabClick={_handleTabClick}
        />
    );
}

export default Settings;
