import {
    ApartmentOutlined,
    BookOutlined,
    BorderlessTableOutlined,
    DatabaseOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Drawer, Menu} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink, useLocation} from 'react-router-dom';
import {useActiveLibrary} from '../../hook/ActiveLibHook';
import {useActiveTree} from '../../hook/ActiveTreeHook';
import {useLang} from '../../hook/LangHook';
import {
    getLibrariesAndTreesListQuery,
    IGetLibrariesAndTreesListQuery
} from '../../queries/LibrariesAndTrees/getLibrariesAndTreesList';
import {localizedLabel} from '../../utils';
import {makeActiveLibraryRoute, makeActiveTreeRoute, routes} from '../Router/Routes/ListRoutes';

interface ISideBarMenuProps {
    visible: boolean;
    hide: () => void;
}

function SideBarMenu({visible, hide}: ISideBarMenuProps): JSX.Element {
    const {t} = useTranslation();

    const location = useLocation();

    const [activeLib] = useActiveLibrary();
    const [activeTree] = useActiveTree();
    const [{lang}] = useLang();

    const [selectedKeys, setSelectedKey] = useState<string[]>([]);

    const {data, error} = useQuery<IGetLibrariesAndTreesListQuery>(getLibrariesAndTreesListQuery);

    useEffect(() => {
        if (activeLib && makeActiveLibraryRoute(activeLib) === location.pathname) {
            setSelectedKey([`library_${activeLib.id}`]);
        }
        if (activeTree && makeActiveTreeRoute(activeTree) === location.pathname) {
            setSelectedKey([`tree_${activeTree.id}`]);
        }

        if (routes.library.list === location.pathname) {
            setSelectedKey([`list-library`]);
        }

        if (routes.navigation.listTree === location.pathname) {
            setSelectedKey([`navigation`]);
        }
    }, [location, setSelectedKey, activeLib, activeTree]);

    if (error) {
        return <div>error</div>;
    }

    return (
        <Drawer
            visible={visible}
            onClose={hide}
            placement="left"
            closable={false}
            getContainer={false}
            style={{position: 'absolute'}}
            bodyStyle={{padding: 0}}
        >
            <Menu
                theme="dark"
                style={{height: '100%'}}
                mode="inline"
                defaultOpenKeys={['recent', 'shortcuts']}
                selectedKeys={selectedKeys}
            >
                {(activeLib || activeTree) && (
                    <Menu.SubMenu key="recent" icon={<BorderlessTableOutlined />} title={t('sidebar.recent')}>
                        {activeLib?.id && (
                            <Menu.Item key={`library_${activeLib.id}`} icon={<DatabaseOutlined />}>
                                <NavLink
                                    to={`/library/items/${activeLib.id}/${activeLib.gql.query}/${activeLib.filter}`}
                                    onClick={hide}
                                    strict
                                    activeClassName="nav-link-active"
                                >
                                    {activeLib.name}
                                </NavLink>
                            </Menu.Item>
                        )}

                        {activeTree?.id && (
                            <Menu.Item key={`tree_${activeTree.id}`} icon={<ApartmentOutlined />}>
                                <NavLink
                                    to={`/navigation/${activeTree.id}`}
                                    onClick={hide}
                                    strict
                                    activeClassName="nav-link-active"
                                >
                                    {activeTree.label || activeTree.id}
                                </NavLink>
                            </Menu.Item>
                        )}
                    </Menu.SubMenu>
                )}

                <Menu.SubMenu key="shortcuts" icon={<UnorderedListOutlined />} title={t('sidebar.shortcuts')}>
                    <Menu.Item key="list-library" icon={<BookOutlined />} onClick={hide}>
                        <NavLink to="/library/list/" activeClassName="nav-link-active">
                            {t('sidebar.lib_list')}
                        </NavLink>
                    </Menu.Item>

                    <Menu.Item key="navigation" icon={<ApartmentOutlined />} onClick={hide}>
                        <NavLink to="/navigation/list" activeClassName="nav-link-active">
                            {t('sidebar.navigation')}
                        </NavLink>
                    </Menu.Item>
                </Menu.SubMenu>

                <Menu.SubMenu key="libraries" icon={<DatabaseOutlined />} title={t('sidebar.libraries')}>
                    {data?.libraries.list.map(lib => (
                        <Menu.Item key={`library_${lib.id}`}>
                            <NavLink
                                key={lib.id}
                                to={`/library/items/${lib.id}/${lib.gqlNames.query}/${lib.gqlNames.filter}`}
                                onClick={hide}
                                activeClassName="nav-link-active"
                            >
                                {localizedLabel(lib.label, lang)}
                            </NavLink>
                        </Menu.Item>
                    ))}
                </Menu.SubMenu>

                <Menu.SubMenu key="trees" icon={<ApartmentOutlined />} title={t('sidebar.trees')}>
                    {data?.trees.list.map(tree => (
                        <Menu.Item key={`tree_${tree.id}`}>
                            <NavLink
                                key={tree.id}
                                to={`/navigation/${tree.id}`}
                                onClick={hide}
                                activeClassName="nav-link-active"
                            >
                                {localizedLabel(tree.label, lang)}
                            </NavLink>
                        </Menu.Item>
                    ))}
                </Menu.SubMenu>
            </Menu>
        </Drawer>
    );
}

export default SideBarMenu;
