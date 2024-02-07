// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import ApplicationsSwitcher from 'components/applications/ApplicationsSwitcher';
import AppIcon from 'components/shared/AppIcon';
import RecordCard from 'components/shared/RecordCard';
import {useCurrentApplicationContext} from 'context/CurrentApplicationContext';
import useLang from 'hooks/useLang';
import useUserData from 'hooks/useUserData';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom-v5';
import {RootState, useAppSelector} from 'reduxStore/store';
import {Loader, Menu} from 'semantic-ui-react';
import styled from 'styled-components';
import UserPanel from '../UserPanel';

const StyledMenu = styled(Menu)`
    &&& {
        height: 3rem;
        background: #f0f0f0;
        color: #000;
    }
`;

const AppLabel = styled.div`
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    padding-left: 1rem;
    height: 100%;
`;

const Header = (): JSX.Element => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const userData = useUserData();
    const [userPanelVisible, setSidebarVisible] = React.useState(false);
    const _toggleUserPanel = () => {
        setSidebarVisible(!userPanelVisible);
    };
    const mutationsWatcher = useAppSelector((state: RootState) => state.mutationsWatcher);
    const applicationData = useCurrentApplicationContext();

    return (
        <>
            <StyledMenu fixed="top" fluid size="large">
                <Menu.Item
                    header
                    as={NavLink}
                    to="/"
                    exact
                    style={{width: '60px', textAlign: 'center', padding: 0}}
                    title={t('admin.title')}
                >
                    <AppIcon
                        size="tiny"
                        style={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'contain',
                            padding: '5px'
                        }}
                    />
                </Menu.Item>
                <AppLabel>
                    {applicationData?.globalSettings.name}
                    &nbsp;-&nbsp;
                    {localizedTranslation(applicationData?.currentApp.label, lang)}
                </AppLabel>
                <Menu.Menu position="right">
                    {mutationsWatcher?.hasPendingMutations && (
                        <Menu.Item>
                            <Loader active inline />
                        </Menu.Item>
                    )}
                    <Menu.Item>
                        <ApplicationsSwitcher />
                    </Menu.Item>
                    <Menu.Item position="right" onClick={_toggleUserPanel}>
                        <RecordCard record={userData.whoAmI} withLibrary={false} />
                    </Menu.Item>
                </Menu.Menu>
            </StyledMenu>
            <UserPanel visible={userPanelVisible} onHide={_toggleUserPanel} />
        </>
    );
};

export default Header;
