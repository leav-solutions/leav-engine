import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';
import {Divider, Icon, Menu, Sidebar} from 'semantic-ui-react';
import useLang from '../../hooks/useLang/__mocks__';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import {localizedLabel} from '../../utils';
import {AvailableLanguage, ILibrary} from '../../_types/types';

interface ISideBarMenuProps {
    visible: boolean;
    hide: () => void;
}

function SideBarMenu({visible, hide}: ISideBarMenuProps): JSX.Element {
    const availableLanguages = useLang().lang as AvailableLanguage[];

    const [libraries, setLibraries] = useState<ILibrary[]>([]);
    const {t} = useTranslation();

    const checkActive = (match: any, location: any) => {
        //some additional logic to verify you are in the home URI
        if (!location) return false;
        const {pathname} = location;
        return pathname === '/';
    };

    const {loading, data, error} = useQuery(getLibrariesListQuery);

    useEffect(() => {
        if (!loading) {
            setLibraries(data?.libraries?.list ?? []);
        }
    }, [loading, data, error]);

    if (error) {
        return <div>error</div>;
    }

    return (
        <Sidebar
            as={Menu}
            icon="labeled"
            inverted
            vertical
            animation="overlay"
            direction="left"
            visible={visible}
            onHide={hide}
            width="thin"
        >
            <Menu.Item as="div" onClick={hide}>
                <Icon name="close" />
                {t('sidebar.close')}
            </Menu.Item>

            {false && (
                <NavLink to="/" onClick={hide} strict activeClassName="nav-link-active" isActive={checkActive}>
                    <Menu.Item as="span">
                        <Icon name="home" />
                        {t('sidebar.home')}
                    </Menu.Item>
                </NavLink>
            )}

            <NavLink to="/library/list/" onClick={hide} activeClassName="nav-link-active">
                <Menu.Item as="span">
                    <Icon name="list ul" />
                    {t('sidebar.lib_list')}
                </Menu.Item>
            </NavLink>

            <NavLink to="/setting" onClick={hide} activeClassName="nav-link-active">
                <Menu.Item as="span">
                    <Icon name="setting" />
                    {t('sidebar.setting')}
                </Menu.Item>
            </NavLink>

            <Divider />

            {libraries.map(lib => (
                <NavLink
                    key={lib.id}
                    to={`/library/items/${lib.id}/${lib.gqlNames.query}`}
                    onClick={hide}
                    activeClassName="nav-link-active"
                >
                    <Menu.Item as="span">
                        <Icon name="database" />
                        {localizedLabel(lib.label, availableLanguages)}
                    </Menu.Item>
                </NavLink>
            ))}
        </Sidebar>
    );
}

export default SideBarMenu;
