// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {StarFilled, StarOutlined, TableOutlined} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {ErrorDisplay, themeVars, useLang} from '@leav/ui';
import {Menu, Spin} from 'antd';
import {type ItemType} from 'antd/es/menu/interface';
import LibraryIcon from '../Home/LibrariesList/LibraryIcon';
import AppIcon from '../shared/AppIcon';
import TreeIcon from '../shared/TreeIcon';
import {saveUserData} from '../../graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from '../../graphQL/queries/userData/getUserData';
import {useActiveLibrary} from '../../hooks/useActiveLibrary';
import {useActiveTree} from '../../hooks/useActiveTree';
import {useApplicationLibraries} from '../../hooks/useApplicationLibraries';
import {useApplicationTrees} from '../../hooks/useApplicationTrees';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {getExplorerLibraryLink, getTreeLink, localizedTranslation} from '../../utils';
import {type GET_LIBRARIES_LIST_libraries_list} from '../../_gqlTypes/GET_LIBRARIES_LIST';
import {type GET_TREES_trees_list} from '../../_gqlTypes/GET_TREES';
import {type GET_USER_DATA, type GET_USER_DATAVariables} from '../../_gqlTypes/GET_USER_DATA';
import {type SAVE_USER_DATA, type SAVE_USER_DATAVariables} from '../../_gqlTypes/SAVE_USER_DATA';
import {FAVORITE_LIBRARIES_KEY, FAVORITE_TREES_KEY} from '../../constants';
import {useState, type FunctionComponent, type MouseEventHandler} from 'react';

interface IGroupedElements<EntityType> {
    related: EntityType[];
    favorites: EntityType[];
    others: EntityType[];
}

const HomeButtonDiv = styled.div`
    height: ${themeVars.headerHeight};
    background: ${themeVars.secondaryBg};
    box-shadow: 0 1px 2px #ccc;
    color: #000;
    text-align: center;
    line-height: 3rem;
    font-size: 1.5rem;
    cursor: pointer;
`;

const NavWrapperDiv = styled.div`
    height: 100%;
`;

const MenuItemContentSpan = styled.span`
    display: inline-flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: 200px;
    gap: 0.5rem;
`;

const LinkSpan = styled.span`
    flex-grow: 1;
`;

const FavoriteStarSpan = styled.span<{$isFavorite: boolean}>`
    display: ${p => (p.$isFavorite ? 'inline' : 'none')};

    ${MenuItemContentSpan}:hover > & {
        display: inline;
    }
`;

enum MenuType {
    TREE = 'tree',
    EXPLORER = 'explorer-library',
}

const Sidebar: FunctionComponent = () => {
    const {t} = useTranslation();
    const {lang} = useLang();

    const [activeLibrary] = useActiveLibrary();
    const [activeTree] = useActiveTree();
    const navigate = useNavigate();

    const {libraries, loading: librariesLoading, error: librariesError} = useApplicationLibraries();
    const {trees, loading: treesLoading, error: treesError} = useApplicationTrees();
    const favoritesList = useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
        variables: {keys: [FAVORITE_LIBRARIES_KEY, FAVORITE_TREES_KEY]},
    });

    const [menuSelected, setMenuSelected] = useState<string[]>([]);

    const [executeSaveUserData] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);

    const activeTreeLibrariesIds = (activeTree?.libraries ?? []).map(l => l.id);
    const activeLibraryTreesIds = activeLibrary?.trees.map(tree => tree.id) ?? [];
    const libraryFavorites = favoritesList?.data?.userData?.data?.[FAVORITE_LIBRARIES_KEY] ?? [];
    const treeFavorites = favoritesList?.data?.userData?.data?.[FAVORITE_TREES_KEY] ?? [];

    const groupedLibraries: IGroupedElements<GET_LIBRARIES_LIST_libraries_list> = libraries.reduce(
        (groups, library) => {
            const newGroups = {...groups};

            if (activeTreeLibrariesIds.includes(library.id)) {
                newGroups.related.push(library);
            } else if (libraryFavorites.includes(library.id)) {
                newGroups.favorites.push(library);
            } else {
                newGroups.others.push(library);
            }

            return newGroups;
        },
        {related: [], favorites: [], others: []},
    );

    const groupedTrees: IGroupedElements<GET_TREES_trees_list> = trees.reduce(
        (groups, tree) => {
            const newGroups = {...groups};

            if (activeLibraryTreesIds.includes(tree.id)) {
                newGroups.related.push(tree);
            } else if (treeFavorites.includes(tree.id)) {
                newGroups.favorites.push(tree);
            } else {
                newGroups.others.push(tree);
            }

            return newGroups;
        },
        {related: [], favorites: [], others: []},
    );

    const _handleToggleFavorite = (wasFavorite: boolean, entityId: string, entityType: 'library' | 'tree') => {
        let newFavorites = [...(entityType === 'library' ? libraryFavorites : treeFavorites)];
        if (wasFavorite) {
            newFavorites = newFavorites.filter(f => f !== entityId);
        } else {
            newFavorites.push(entityId);
        }

        executeSaveUserData({
            variables: {
                key: entityType === 'library' ? FAVORITE_LIBRARIES_KEY : FAVORITE_TREES_KEY,
                value: newFavorites,
                global: false,
            },
        });
    };

    const _goTo = (url: string) => navigate(url);

    const _goToExplorerOnActiveLibrary = () => {
        if (!activeLibrary?.id) {
            return;
        }

        setMenuSelected([MenuType.EXPLORER]);
        _goTo(getExplorerLibraryLink(activeLibrary.id));
    };

    const _goToActiveTree = () => {
        if (!activeTree?.id) {
            return;
        }

        setMenuSelected([MenuType.TREE]);
        _goTo(getTreeLink(activeTree.id));
    };

    const _handleClickHome = () => _goTo('/');

    let libsMenuItems: (menuType: MenuType) => ItemType[];

    if (librariesLoading || favoritesList.loading) {
        libsMenuItems = menuType => [
            {
                key: `libs-loading_${menuType}`,
                label: <Spin />,
            },
        ];
    } else if (librariesError || favoritesList.error) {
        libsMenuItems = menuType => [
            {
                key: `libs-error_${menuType}`,
                label: <ErrorDisplay message={librariesError || favoritesList?.error?.message} />,
            },
        ];
    } else {
        libsMenuItems = menuType =>
            Object.keys(groupedLibraries).map(libraryGroupKey => {
                if (!groupedLibraries[libraryGroupKey].length) {
                    return null;
                }

                return {
                    key: `${libraryGroupKey}_libraries_${menuType}`,
                    type: 'group',
                    label: t(`sidebar.${libraryGroupKey}_libraries`),
                    children: groupedLibraries[libraryGroupKey].map(lib => {
                        const isFavorite = libraryFavorites.includes(lib.id);
                        const _handleFavoriteClick: MouseEventHandler<HTMLSpanElement> = e => {
                            e.preventDefault();
                            e.stopPropagation();
                            _handleToggleFavorite(isFavorite, lib.id, 'library');
                        };

                        return {
                            key: `library.${lib.id}_${menuType}`,
                            label: (
                                <MenuItemContentSpan>
                                    <LibraryIcon library={lib} />
                                    <LinkSpan
                                        onClick={() => {
                                            setMenuSelected([menuType]);
                                            return _goTo(getExplorerLibraryLink(lib.id));
                                        }}
                                    >
                                        {localizedTranslation(lib.label, lang)}
                                    </LinkSpan>
                                    <FavoriteStarSpan onClick={_handleFavoriteClick} $isFavorite={isFavorite}>
                                        {isFavorite ? <StarFilled /> : <StarOutlined />}
                                    </FavoriteStarSpan>
                                </MenuItemContentSpan>
                            ),
                        };
                    }),
                };
            });
    }

    let treesMenuItems: ItemType[];
    if (treesLoading || favoritesList.loading) {
        treesMenuItems = [
            {
                key: 'trees-loading',
                label: <Spin />,
            },
        ];
    } else if (treesError || favoritesList.error) {
        treesMenuItems = [
            {
                key: 'trees-error',
                label: <ErrorDisplay message={treesError || favoritesList?.error?.message} />,
            },
        ];
    } else {
        treesMenuItems = Object.keys(groupedTrees).map(treeGroupKey => {
            if (!groupedTrees[treeGroupKey].length) {
                return null;
            }

            return {
                key: `${treeGroupKey}_trees`,
                type: 'group',
                label: t(`sidebar.${treeGroupKey}_trees`),
                children: groupedTrees[treeGroupKey].map(({id, label}: GET_TREES_trees_list) => {
                    const isFavorite = treeFavorites.includes(id);
                    const _handleFavoriteClick: MouseEventHandler<HTMLSpanElement> = e => {
                        e.preventDefault();
                        e.stopPropagation();
                        _handleToggleFavorite(isFavorite, id, 'tree');
                    };

                    return {
                        key: `tree.${id}`,
                        label: (
                            <MenuItemContentSpan>
                                <TreeIcon style={{fontSize: '1.2rem'}} />
                                <LinkSpan
                                    onClick={() => {
                                        setMenuSelected([MenuType.TREE]);
                                        _goTo(getTreeLink(id));
                                    }}
                                >
                                    {localizedTranslation(label, lang)}
                                </LinkSpan>
                                <FavoriteStarSpan onClick={_handleFavoriteClick} $isFavorite={isFavorite}>
                                    {isFavorite ? <StarFilled /> : <StarOutlined />}
                                </FavoriteStarSpan>
                            </MenuItemContentSpan>
                        ),
                    };
                }),
            };
        });
    }

    const menuItems: ItemType[] = [
        {
            key: MenuType.EXPLORER,
            icon: <TableOutlined onClick={_goToExplorerOnActiveLibrary} />,
            label: t('app_settings.explorer'),
            onTitleClick: _goToExplorerOnActiveLibrary,
            children: libsMenuItems(MenuType.EXPLORER),
        },
        {
            icon: <TreeIcon onClick={_goToActiveTree} />,
            label: !!activeTree?.label ? activeTree.label : t('sidebar.tree'),
            key: MenuType.TREE,
            onTitleClick: _goToActiveTree,
            children: treesMenuItems,
        },
    ];

    return (
        <>
            <HomeButtonDiv onClick={_handleClickHome}>
                <AppIcon
                    size="tiny"
                    style={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'contain',
                        padding: '5px',
                        verticalAlign: 'top',
                    }}
                />
            </HomeButtonDiv>
            <NavWrapperDiv>
                <Menu style={{width: '100%'}} selectedKeys={menuSelected} items={menuItems} />
            </NavWrapperDiv>
        </>
    );
};

export default Sidebar;
