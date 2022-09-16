// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Drawer, Menu} from 'antd';
import useAuth from 'hooks/useAuth';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

interface INotifsPanelProps {
    notifsPanelVisible: boolean;
    hideNotifsPanel: () => void;
}

const CustomMenu = styled(Menu)`
    .anticon {
        margin-right: 0.5em;
    }
`;

function NotifsPanel({notifsPanelVisible, hideNotifsPanel}: INotifsPanelProps): JSX.Element {
    const {t} = useTranslation();
    const {logout} = useAuth();

    const _handleLogout = () => {
        logout();
    };

    return (
        <Drawer
            visible={notifsPanelVisible}
            onClose={hideNotifsPanel}
            placement="right"
            closable={false}
            getContainer={false}
            bodyStyle={{padding: 0}}
        >
            <CustomMenu
                style={{
                    height: '100%'
                }}
                mode="inline"
                items={[]}
            />
        </Drawer>
    );
}

export default NotifsPanel;
