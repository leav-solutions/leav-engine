// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import GridTab from 'components/shared/GridTab';
import {useEditApplicationContext} from 'context/EditApplicationContext';
import useLang from 'hooks/useLang';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router';
import {Header, Icon, Tab, TabProps} from 'semantic-ui-react';
import {ApplicationInstallStatus, ApplicationType} from '_gqlTypes/globalTypes';
import InfosTab from './InfosTab';
import InstallTab from './InstallTab';
import PermissionsTab from './PermissionsTab';
import SettingsTab from './SettingsTab';

function EditApplicationTabs(): JSX.Element {
    const {t} = useTranslation();
    const {application} = useEditApplicationContext();
    const {lang} = useLang();
    const isNewApp = !application;
    const location = useLocation();
    const history = useHistory();

    // Retrieve active tab from URL
    const tabName = location.hash.replace('#', '');

    const panes = [
        {
            key: 'infos',
            menuItem: t('applications.information'),
            displayCondition: true,
            render: () => (
                <Tab.Pane key="info" className="grow">
                    <InfosTab />
                </Tab.Pane>
            )
        },
        {
            key: 'permissions',
            menuItem: t('admin.permissions'),
            displayCondition: !isNewApp,
            render: () => (
                <Tab.Pane key="permissions" className="" style={{display: 'grid'}}>
                    <PermissionsTab />
                </Tab.Pane>
            )
        },
        {
            key: 'settings',
            menuItem: t('applications.settings'),
            displayCondition: !isNewApp,
            render: () => (
                <Tab.Pane key="settings" style={{padding: 0}}>
                    <SettingsTab />
                </Tab.Pane>
            )
        },
        {
            key: 'install',
            menuItem: t('applications.install'),
            displayCondition: !isNewApp && application.type === ApplicationType.internal,
            render: () => (
                <Tab.Pane key="install" className="">
                    <InstallTab />
                </Tab.Pane>
            )
        }
    ].filter(p => p.displayCondition);

    const [activeIndex, setActiveIndex] = useState<number>(tabName ? panes.findIndex(p => tabName === p.key) : 0);

    const _handleTabChange = (_, data: TabProps) => {
        if (data.panes && data.activeIndex !== undefined) {
            setActiveIndex(Number(data.activeIndex.toString()));
            history.replace(`#${data.panes[data.activeIndex].key}`);
        }
    };

    const headerLabel = application?.label ? localizedTranslation(application.label, lang) : t('applications.new');
    const isAppReady = !isNewApp && application?.install?.status === ApplicationInstallStatus.SUCCESS;
    return (
        <>
            <Header>
                <Header.Content>{headerLabel}</Header.Content>
                {isAppReady && (
                    <Header.Subheader as="a" href={application.url}>
                        <Icon name="external alternate" />
                        {t('applications.open_application')}
                    </Header.Subheader>
                )}
            </Header>
            <GridTab
                menu={{secondary: true, pointing: true}}
                panes={panes}
                onTabChange={_handleTabChange}
                activeIndex={activeIndex}
            />
        </>
    );
}

export default EditApplicationTabs;
