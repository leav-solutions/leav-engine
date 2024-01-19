// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FlagOutlined, LogoutOutlined} from '@ant-design/icons';
import {useAuth, useLang} from '@leav/ui';
import {getFlagByLang} from '@leav/utils';
import {Drawer} from 'antd';
import {KitMenu} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {styled} from 'styled-components';

const FlagWrapper = styled.span`
    margin-right: 0.5rem;
`;

interface IUserPanelProps {
    isVisible: boolean;
    onClose: () => void;
}

function UserPanel({isVisible, onClose}: IUserPanelProps): JSX.Element {
    const {t} = useTranslation();
    const {logout} = useAuth();
    const {availableLangs, lang: activeLang, setLang} = useLang();
    const _handleLogout = () => {
        logout();
    };
    const currentLang = activeLang[0];

    const currentLangAction = {
        icon: <FlagWrapper>{getFlagByLang(currentLang)}</FlagWrapper>,
        label: t(`lang.${currentLang}`),
        onClick: null,
        isActive: true
    };

    const langMenuActions = availableLangs.map(lang => ({
        icon: <FlagWrapper>{getFlagByLang(lang)}</FlagWrapper>,
        label: t(`lang.${lang}`),
        onClick: () => setLang(lang),
        isActive: activeLang.indexOf(lang) !== -1
    }));

    return (
        <Drawer
            closeIcon={false}
            closable={false}
            placement="right"
            onClose={onClose}
            open={isVisible}
            bodyStyle={{padding: 0}}
            data-testid="user-panel"
        >
            <KitMenu.Item
                icon={<FlagOutlined />}
                actions={[currentLangAction, ...langMenuActions]}
                title={t('global.language')}
            />
            <KitMenu.Item icon={<LogoutOutlined />} title={t('logout')} onClick={_handleLogout} />
        </Drawer>
    );
}

export default UserPanel;
