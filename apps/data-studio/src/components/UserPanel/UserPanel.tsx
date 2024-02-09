// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CarryOutOutlined, DoubleRightOutlined, ExclamationCircleOutlined, LogoutOutlined} from '@ant-design/icons';
import {useAuth} from '@leav/ui';
import {Drawer, Menu} from 'antd';
import AvailableSoon from 'components/shared/AvailableSoon';
import LEAVEngineIcon from 'components/shared/LEAVEngineIcon';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import LangSwitcher from './LangSwitcher';

interface IUserPanelProps {
    userPanelVisible: boolean;
    hideUserPanel: () => void;
}

const CustomMenu = styled(Menu)`
    .anticon {
        margin-right: 0.5em;
    }
`;

function UserPanel({userPanelVisible, hideUserPanel}: IUserPanelProps): JSX.Element {
    const {t} = useTranslation();
    const {logout} = useAuth();

    const _handleLogout = () => {
        logout();
    };

    return (
        <Drawer
            open={userPanelVisible}
            onClose={hideUserPanel}
            placement="right"
            closable={false}
            styles={{
                body: {padding: 0}
            }}
        >
            <CustomMenu
                style={{
                    height: '100%'
                }}
                mode="inline"
                items={[
                    {
                        disabled: true,
                        key: 'tasks',
                        label: (
                            <>
                                <CarryOutOutlined />
                                {t('menu.user_menu.tasks')}
                                <AvailableSoon />
                            </>
                        )
                    },
                    {
                        disabled: true,
                        key: 'shortcuts',
                        label: (
                            <>
                                <DoubleRightOutlined />
                                {t('menu.user_menu.shortcuts')}
                                <AvailableSoon />
                            </>
                        )
                    },
                    {
                        disabled: true,
                        key: 'events',
                        label: (
                            <>
                                <ExclamationCircleOutlined />
                                {t('menu.user_menu.events')}
                                <AvailableSoon />
                            </>
                        )
                    },

                    {key: 'lang-switcher', label: <LangSwitcher />},
                    {
                        onClick: _handleLogout,
                        key: 'logout',
                        label: (
                            <>
                                <LogoutOutlined />
                                {t('menu.user_menu.logout')}
                            </>
                        )
                    }
                ]}
            />
            <a href="https://leav-engine.com" target="_blank">
                <LEAVEngineIcon height="30px" style={{position: 'absolute', bottom: '15px', width: '100%'}} />
            </a>
        </Drawer>
    );
}
export default UserPanel;
