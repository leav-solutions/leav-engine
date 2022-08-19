// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApplicationsSwitcher from 'components/applications/ApplicationsSwitcher';
import RecordCard from 'components/shared/RecordCard';
import useUserData from 'hooks/useUserData';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';
import {Icon, Menu} from 'semantic-ui-react';
import styled from 'styled-components';
import UserPanel from '../UserPanel';

const StyledMenu = styled(Menu)`
    &&& {
        height: 3rem;
        background: transparent linear-gradient(85deg, #0f2027 0%, #203a43 52%, #2c5364 100%) 0% 0% no-repeat
            padding-box;
    }
`;

const Header = (): JSX.Element => {
    const {t} = useTranslation();
    const userData = useUserData();
    const [userPanelVisible, setSidebarVisible] = React.useState(false);
    const _toggleUserPanel = () => {
        setSidebarVisible(!userPanelVisible);
    };

    return (
        <>
            <StyledMenu fixed="top" fluid inverted size="large">
                <Menu.Item header as={NavLink} to="/" exact style={{width: '70px'}} title={t('admin.title')}>
                    <Icon name="home" size="big" />
                </Menu.Item>
                <Menu.Menu position="right">
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
