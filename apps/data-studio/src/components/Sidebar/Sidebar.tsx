// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DatabaseOutlined, StarFilled, StarOutlined} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {themeVars} from '@leav/ui';
import {Menu, Spin} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import {FAVORITE_LIBRARIES_KEY} from 'components/Home/LibrariesList/LibrariesList';
import LibraryIcon from 'components/Home/LibrariesList/LibraryIcon';
import {FAVORITE_TREES_KEY} from 'components/Home/TreeList/TreeList';
import AppIcon from 'components/shared/AppIcon';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import TreeIcon from 'components/shared/TreeIcon';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import {useLang} from 'hooks/LangHook/LangHook';
import useGetLibrariesListQuery from 'hooks/useGetLibrariesListQuery/useGetLibrariesListQuery';
import useGetTreesListQuery from 'hooks/useGetTreesListQuery/useGetTreesListQuery';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {getLibraryLink, getTreeLink, localizedTranslation} from 'utils';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {GET_TREE_LIST_QUERY_trees_list} from '_gqlTypes/GET_TREE_LIST_QUERY';
import {GET_USER_DATA, GET_USER_DATAVariables} from '_gqlTypes/GET_USER_DATA';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '_gqlTypes/SAVE_USER_DATA';

interface IGroupedElements<EntityType> {
    related: EntityType[];
    favorites: EntityType[];
    others: EntityType[];
}

const HomeButton = styled.div`
    height: ${themeVars.headerHeight};
    background: ${themeVars.secondaryBg};
    box-shadow: 0 1px 2px #ccc;
    color: #000;
    text-align: center;
    line-height: 3rem;
    font-size: 1.5rem;
    cursor: pointer;
`;

const NavWrapper = styled.div`
    height: 100%;
`;

const MenuItemContent = styled.span`
    display: inline-flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: 200px;
    gap: 0.5rem;
`;

const Link = styled.span`
    flex-grow: 1;
`;

const FavoriteStar = styled.span<{isFavorite: boolean}>`
    display: ${p => (p.isFavorite ? 'inline' : 'none')};

    ${MenuItemContent}:hover > & {
        display: inline;
    }
`;

function Sidebar(): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const [activeLibrary] = useActiveLibrary();
    const [activeTree] = useActiveTree();
    const history = useHistory();
    const {activePanel} = useAppSelector(state => state);

    const librariesList = useGetLibrariesListQuery();
    const treesList = useGetTreesListQuery();
    const favoritesList = useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
        variables: {keys: [FAVORITE_LIBRARIES_KEY, FAVORITE_TREES_KEY]}
    });

    const [executeSaveUserData] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);

    const activeTreeLibrariesIds = (activeTree?.libraries ?? []).map(l => l.id);
    const activeLibraryTreesIds = activeLibrary?.trees.map(tree => tree.id) ?? [];
    const libraryFavorites = favoritesList?.data?.userData?.data?.[FAVORITE_LIBRARIES_KEY] ?? [];
    const treeFavorites = favoritesList?.data?.userData?.data?.[FAVORITE_TREES_KEY] ?? [];

    const groupedLibraries: IGroupedElements<GET_LIBRARIES_LIST_libraries_list> = (
        librariesList?.data?.libraries?.list ?? []
    ).reduce(
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

    const groupedTrees: IGroupedElements<GET_TREE_LIST_QUERY_trees_list> = (treesList?.data?.trees?.list ?? []).reduce(
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

    const _goTo = (url: string) => history.push(url);

    const _goToActiveLibrary = () => {
        if (!activeLibrary?.id) {
            return;
        }

        _goTo(getLibraryLink(activeLibrary.id));
    };

    const _goToActiveTree = () => {
        if (!activeTree?.id) {
            return;
        }

        _goTo(getTreeLink(activeTree.id));
    };

    const _handleClickHome = () => _goTo('/');

    let libsMenuItems: ItemType[] = [];

    if (librariesList.loading || favoritesList.loading) {
        libsMenuItems = [
            {
                key: 'libs-loading',
                label: <Spin />
            }
        ];
    } else if (librariesList.error || favoritesList.error) {
        libsMenuItems = [
            {
                key: 'libs-error',
                label: <ErrorDisplay message={(librariesList.error || favoritesList.error).message} />
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
                    const _handleFavoriteClick = e => {
                        e.preventDefault();
                        e.stopPropagation();
                        _handleToggleFavorite(isFavorite, lib.id, 'library');
                    };

                    return {
                        key: `library.${lib.id}`,
                        label: (
                            <MenuItemContent>
                                <LibraryIcon library={lib} />
                                <Link onClick={() => _goTo(getLibraryLink(lib.id))}>
                                    {localizedTranslation(lib.label, lang)}
                                </Link>
                                <FavoriteStar onClick={_handleFavoriteClick} isFavorite={isFavorite}>
                                    {isFavorite ? <StarFilled /> : <StarOutlined />}
                                </FavoriteStar>
                            </MenuItemContent>
                        )
                    };
                })
            };
        });
    }

    let treesMenuItems: ItemType[] = [];
    if (treesList.loading || favoritesList.loading) {
        treesMenuItems = [
            {
                key: 'trees-loading',
                label: <Spin />
            }
        ];
    } else if (treesList.error || favoritesList.error) {
        treesMenuItems = [
            {
                key: 'trees-error',
                label: <ErrorDisplay message={(librariesList.error || favoritesList.error).message} />
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
                children: groupedTrees[treeGroupKey].map(tree => {
                    const isFavorite = treeFavorites.includes(tree.id);
                    const _handleFavoriteClick = e => {
                        e.preventDefault();
                        e.stopPropagation();
                        _handleToggleFavorite(isFavorite, tree.id, 'tree');
                    };

                    return {
                        key: `tree.${tree.id}`,
                        label: (
                            <MenuItemContent>
                                <TreeIcon style={{fontSize: '1.2rem'}} />
                                <Link onClick={() => _goTo(getTreeLink(tree.id))}>
                                    {localizedTranslation(tree.label, lang)}
                                </Link>
                                <FavoriteStar onClick={_handleFavoriteClick} isFavorite={isFavorite}>
                                    {isFavorite ? <StarFilled /> : <StarOutlined />}
                                </FavoriteStar>
                            </MenuItemContent>
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
        }
    ];

    return (
        <>
            <HomeButton onClick={_handleClickHome}>
                <AppIcon
                    size="tiny"
                    style={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'contain',
                        padding: '5px'
                    }}
                />
            </HomeButton>
            <NavWrapper>
                <Menu
                    style={{width: '100%'}}
                    selectedKeys={[activePanel, `${activePanel}.${activeLibrary?.id || activeTree?.id}`]}
                    activeKey={activePanel}
                    items={menuItems}
                />
            </NavWrapper>
        </>
    );
}

export default Sidebar;
