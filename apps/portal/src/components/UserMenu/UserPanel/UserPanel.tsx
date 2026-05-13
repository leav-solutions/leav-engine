import {FlagOutlined, LogoutOutlined} from '@ant-design/icons';
import {useAuth, useLang} from '@leav/ui';
import {getFlagByLang} from '@leav/utils';
import {Button, Drawer, Menu} from 'antd';
import {useTranslation} from 'react-i18next';
import {styled} from 'styled-components';
import {type FunctionComponent} from 'react';

const CustomMenu = styled(Menu)`
    .anticon {
        margin-right: 0.5em;
    }
`;

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

interface IUserPanelProps {
    isVisible: boolean;
    onClose: () => void;
}

const UserPanel: FunctionComponent<IUserPanelProps> = ({isVisible, onClose}) => {
    const {t} = useTranslation();
    const {logout} = useAuth();
    const {availableLangs, setLang, defaultLang} = useLang();

    const _handleLogout = () => logout();

    return (
        <Drawer
            open={isVisible}
            onClose={onClose}
            placement="right"
            closeIcon={false}
            closable={false}
            styles={{
                body: {padding: 0},
            }}
            data-testid="user-panel"
        >
            <CustomMenu
                style={{
                    height: '100%',
                }}
                mode="inline"
                items={[
                    {
                        key: 'lang-switcher',
                        label: (
                            <Wrapper>
                                <FlagOutlined />
                                {t('global.language')}
                                <div style={{marginInlineStart: '10px'}}>
                                    {availableLangs.map(l => (
                                        <Button
                                            size="small"
                                            shape="circle"
                                            type={l === defaultLang ? 'text' : 'default'}
                                            name={l}
                                            key={l}
                                            style={{padding: '5 5px'}}
                                            onClick={() => setLang(l)}
                                            icon={getFlagByLang(l)}
                                        />
                                    ))}
                                </div>
                            </Wrapper>
                        ),
                    },
                    {
                        onClick: _handleLogout,
                        key: 'logout',
                        label: (
                            <>
                                <LogoutOutlined />
                                {t('logout')}
                            </>
                        ),
                    },
                ]}
            />
        </Drawer>
    );
};

export default UserPanel;
