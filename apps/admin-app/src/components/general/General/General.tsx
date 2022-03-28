// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useUserData from 'hooks/useUserData';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router';
import {Header, Icon, Tab, TabProps} from 'semantic-ui-react';
import {PermissionsActions} from '_gqlTypes/globalTypes';
import GeneralAdminPermissionsTab from './GeneralAdminPermissionsTab';
import GeneralInfosTab from './GeneralInfosTab';

function General(): JSX.Element {
    const {t} = useTranslation();
    const userData = useUserData();
    const location = useLocation();
    const history = useHistory();

    const panes = [
        {
            key: 'infos',
            menuItem: t('general.infos'),
            render: () => (
                <Tab.Pane key="infos" className="grow">
                    <GeneralInfosTab />
                </Tab.Pane>
            )
        }
    ];

    if (userData.permissions[PermissionsActions.app_access_permissions]) {
        panes.push({
            key: 'admin_permissions',
            menuItem: t('general.admin_permissions'),
            render: () => {
                return (
                    <Tab.Pane key="permissions" className="grow flex-col height100">
                        <GeneralAdminPermissionsTab />
                    </Tab.Pane>
                );
            }
        });
    }

    const tabName = location?.hash?.replace('#', '');
    const [activeIndex, setActiveIndex] = useState<number>(
        Math.max(
            panes.findIndex(p => tabName === p.key),
            0
        )
    );

    const _handleOnTabChange = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: TabProps) => {
        if (data.panes && data.activeIndex !== undefined) {
            setActiveIndex(Number(data.activeIndex.toString()));
            history?.push(`#${data.panes[data.activeIndex].key}`);
        }
    };
    return (
        <>
            <Header className="no-grow">
                <Icon name="cogs" />
                {t('general.title')}
            </Header>
            <Tab
                activeIndex={activeIndex}
                onTabChange={_handleOnTabChange}
                menu={{secondary: true, pointing: true}}
                panes={panes}
                className="grow flex-col height100"
            />
        </>
    );
}

export default General;
