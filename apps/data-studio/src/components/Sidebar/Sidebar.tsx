// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DatabaseOutlined, SettingOutlined, StarFilled, StarOutlined, TableOutlined} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {ErrorDisplay, themeVars, useLang} from '@leav/ui';
import {Menu, Spin} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import LibraryIcon from 'components/Home/LibrariesList/LibraryIcon';
import AppIcon from 'components/shared/AppIcon';
import TreeIcon from 'components/shared/TreeIcon';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {useActiveLibrary} from 'hooks/useActiveLibrary';
import {useActiveTree} from 'hooks/useActiveTree';
import {useApplicationLibraries} from 'hooks/useApplicationLibraries';
import {useApplicationTrees} from 'hooks/useApplicationTrees';
import {useTranslation} from 'react-i18next';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useAppSelector} from 'reduxStore/store';
import styled from 'styled-components';
import {explorerQueryParamName, getExplorerLibraryLink, getLibraryLink, getTreeLink, localizedTranslation} from 'utils';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {GET_TREES_trees_list} from '_gqlTypes/GET_TREES';
import {GET_USER_DATA, GET_USER_DATAVariables} from '_gqlTypes/GET_USER_DATA';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '_gqlTypes/SAVE_USER_DATA';
import {FAVORITE_LIBRARIES_KEY, FAVORITE_TREES_KEY} from '../../constants';
import {FunctionComponent, MouseEventHandler} from 'react';

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

const explorerTabKey = 'explorer';

const Sidebar: FunctionComponent = () => {
    const {t} = useTranslation();
    const {lang} = useLang();

    const [params] = useSearchParams();

    const [activeLibrary] = useActiveLibrary();
    const [activeTree] = useActiveTree();
    const navigate = useNavigate();
    const {activePanel} = useAppSelector(state => state);

    const {libraries, loading: librariesLoading, error: librariesError} = useApplicationLibraries();
    const {trees, loading: treesLoading, error: treesError} = useApplicationTrees();
    const favoritesList = useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
        variables: {keys: [FAVORITE_LIBRARIES_KEY, FAVORITE_TREES_KEY]}
    });

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
        {related: [], favorites: [], others: []}
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
        {related: [], favorites: [], others: []}
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
                global: false
            }
        });
    };

    const _goTo = (url: string) => navigate(url);

    const _goToActiveLibrary = () => {
        if (!activeLibrary?.id) {
            return;
        }

        _goTo(getLibraryLink(activeLibrary.id));
    };

    const _goToExplorerOnActiveLibrary = () => {
        if (!activeLibrary?.id) {
            return;
        }

        _goTo(getExplorerLibraryLink(activeLibrary.id));
    };

    const _goToActiveTree = () => {
        if (!activeTree?.id) {
            return;
        }

        _goTo(getTreeLink(activeTree.id));
    };

    const _goToSettings = () => {
        _goTo('/settings');
    };

    const _handleClickHome = () => _goTo('/');

    let libsMenuItems: ItemType[];

    if (librariesLoading || favoritesList.loading) {
        libsMenuItems = [
            {
                key: 'libs-loading',
                label: <Spin />
            }
        ];
    } else if (librariesError || favoritesList.error) {
        libsMenuItems = [
            {
                key: 'libs-error',
                label: <ErrorDisplay message={librariesError || favoritesList?.error?.message} />
            }
        ];
    } else {
        libsMenuItems = Object.keys(groupedLibraries).map(libraryGroupKey => {
            if (!groupedLibraries[libraryGroupKey].length) {
                return null;
            }

            return {
                key: `${libraryGroupKey}_libraries`,
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
                        key: `library.${lib.id}`,
                        label: (
                            <MenuItemContentSpan>
                                <LibraryIcon library={lib} />
                                <LinkSpan onClick={() => _goTo(getLibraryLink(lib.id))}>
                                    {localizedTranslation(lib.label, lang)}
                                </LinkSpan>
                                <FavoriteStarSpan onClick={_handleFavoriteClick} $isFavorite={isFavorite}>
                                    {isFavorite ? <StarFilled /> : <StarOutlined />}
                                </FavoriteStarSpan>
                            </MenuItemContentSpan>
                        )
                    };
                })
            };
        });
    }

    let treesMenuItems: ItemType[];
    if (treesLoading || favoritesList.loading) {
        treesMenuItems = [
            {
                key: 'trees-loading',
                label: <Spin />
            }
        ];
    } else if (treesError || favoritesList.error) {
        treesMenuItems = [
            {
                key: 'trees-error',
                label: <ErrorDisplay message={treesError || favoritesList?.error?.message} />
            }
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
                                <LinkSpan onClick={() => _goTo(getTreeLink(id))}>
                                    {localizedTranslation(label, lang)}
                                </LinkSpan>
                                <FavoriteStarSpan onClick={_handleFavoriteClick} $isFavorite={isFavorite}>
                                    {isFavorite ? <StarFilled /> : <StarOutlined />}
                                </FavoriteStarSpan>
                            </MenuItemContentSpan>
                        )
                    };
                })
            };
        });
    }

    const menuItems: ItemType[] = [
        {
            key: 'library',
            icon: <DatabaseOutlined onClick={_goToActiveLibrary} />,
            label: !!activeLibrary?.name ? activeLibrary.name : t('sidebar.library'),
            onTitleClick: _goToActiveLibrary,
            children: libsMenuItems
        },
        {
            icon: <TreeIcon onClick={_goToActiveTree} />,
            label: !!activeTree?.label ? activeTree.label : t('sidebar.tree'),
            key: 'tree',
            onTitleClick: _goToActiveTree,
            children: treesMenuItems
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: t('app_settings.title'),
            onClick: _goToSettings
        },
        {
            key: explorerTabKey,
            icon: <TableOutlined />,
            label: t('app_settings.explorer'),
            onClick: _goToExplorerOnActiveLibrary
        }
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
                        verticalAlign: 'top'
                    }}
                />
            </HomeButtonDiv>
            <NavWrapperDiv>
                <Menu
                    style={{width: '100%'}}
                    selectedKeys={
                        params.has(explorerQueryParamName)
                            ? [explorerTabKey]
                            : [activePanel, `${activePanel}.${activeLibrary?.id || activeTree?.id}`]
                    }
                    items={menuItems}
                />
            </NavWrapperDiv>
        </>
    );
};

export default Sidebar;
