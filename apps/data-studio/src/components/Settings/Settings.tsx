// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSubscription} from '@apollo/client';
import {Tabs, TabsProps} from 'antd';
import {getApplicationsEventsSubscription} from 'graphQL/subscribes/applications/getApplicationsEventsSubscription';
import {useTranslation} from 'react-i18next';
import {APPLICATION_EVENTS, APPLICATION_EVENTSVariables} from '_gqlTypes/APPLICATION_EVENTS';
import ApplicationSettings from './ApplicationSettings';
import LibrariesSettings from './LibrariesSettings';
import TreesSettings from './TreesSettings';

function Settings(): JSX.Element {
    const {t} = useTranslation();
    useSubscription<APPLICATION_EVENTS, APPLICATION_EVENTSVariables>(getApplicationsEventsSubscription);

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
            children: <LibrariesSettings />
        },
        {
            key: 'trees',
            label: t('app_settings.trees'),
            children: <TreesSettings />
        }
    ];

    return (
        <Tabs
            tabPosition="left"
            defaultActiveKey="application"
            items={tabsItems}
            style={{height: '100%', overflow: 'auto'}}
            tabBarStyle={{width: 250}}
        />
    );
}

export default Settings;
