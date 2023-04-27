// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSubscription} from '@apollo/client';
import {Tabs, TabsProps} from 'antd';
import {getApplicationsEventsSubscription} from 'graphQL/subscribes/applications/getApplicationsEventsSubscription';
import {useTranslation} from 'react-i18next';
import {useHistory, useParams, useRouteMatch} from 'react-router-dom';
import {APPLICATION_EVENTS, APPLICATION_EVENTSVariables} from '_gqlTypes/APPLICATION_EVENTS';
import ApplicationSettings from './ApplicationSettings';
import LibrariesSettings from './LibrariesSettings';
import TreesSettings from './TreesSettings';

function Settings(): JSX.Element {
    const {t} = useTranslation();
    useSubscription<APPLICATION_EVENTS, APPLICATION_EVENTSVariables>(getApplicationsEventsSubscription);
    const history = useHistory();
    const urlParams = useParams<{tabId?: string}>();
    const routeMatch = useRouteMatch();

    const tabsItems: TabsProps['items'] = [
        {
            key: 'application',
            label: t('app_settings.application'),
            children: <ApplicationSettings />,
            style: {padding: 0}
        },
        {
            key: 'libraries',
            label: t('app_settings.libraries'),
            children: <LibrariesSettings />,
            style: {padding: 0}
        },
        {
            key: 'trees',
            label: t('app_settings.trees'),
            children: <TreesSettings />,
            style: {padding: 0}
        }
    ];

    const _handleTabClick = (key: string) => {
        // Extract base path from url: url minus tabId if any
        const basePath = routeMatch?.url.replace(`/${urlParams.tabId}`, '');

        // Add current tab to url
        history.push(`${basePath}/${key}`);
    };

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
