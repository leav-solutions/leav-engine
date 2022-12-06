// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import ApplicationsSwitcher from 'components/applications/ApplicationsSwitcher';
import RecordCard from 'components/shared/RecordCard';
import {useCurrentApplicationContext} from 'context/CurrentApplicationContext';
import useLang from 'hooks/useLang';
import useUserData from 'hooks/useUserData';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';
import {RootState, useAppSelector} from 'redux/store';
import {Icon, Loader, Menu} from 'semantic-ui-react';
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
    const currentApp = useCurrentApplicationContext();

    return (
        <>
            <StyledMenu fixed="top" fluid size="large">
                <Menu.Item
                    header
                    as={NavLink}
                    to="/"
                    exact
                    style={{width: '60px', textAlign: 'center'}}
                    title={t('admin.title')}
                >
                    <Icon name="home" style={{fontSize: 'calc(1.5rem - 2px)'}} />
                </Menu.Item>
                <AppLabel>
                    {t('admin.document_title', {appLabel: localizedTranslation(currentApp?.label, lang)})}
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
