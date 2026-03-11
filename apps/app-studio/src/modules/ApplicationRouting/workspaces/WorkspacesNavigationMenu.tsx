// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitAvatar, KitIdCard, KitSideMenu, KitTypography} from 'aristid-ds';
import {useMemo, useState, type FunctionComponent, type ComponentProps, useContext} from 'react';
import {useNavigate, generatePath, useParams, Outlet} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {type IconProp} from '@fortawesome/fontawesome-svg-core';
import {localizedTranslation} from '@leav/utils';
import {LangContext} from '@leav/ui';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {useMenuOpenStorage} from './useMenuOpenStorage';
import {UnreachablePaths} from '../router/paths';
import {faThumbtack} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';
import {type Application} from '../types';
import {workspacesNavigationMenu} from './workspacesNavigationMenu.module.css';
import {MIN_WORKSPACES_TO_SHOW_SEARCH} from '../../../constants';

export const WorkspacesNavigationMenu: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId} = useParams();
    const {lang} = useContext(LangContext);
    const {isMenuOpen, handleToggleMenu} = useMenuOpenStorage();
    const {t} = useTranslation();

    const [searchWorkspaceValue, setSearchWorkspaceValue] = useState('');

    const initialWorkspaceCount = useMemo(() => (application?.workspaces ?? []).length, [application?.workspaces]);

    const showSearch = initialWorkspaceCount >= MIN_WORKSPACES_TO_SHOW_SEARCH || !!searchWorkspaceValue;

    const navigate = useNavigate();

    const _filterWorkspacesOnSearchValue = (workspace: Application['workspaces'][number]) => {
        if (!searchWorkspaceValue) {
            return true;
        }
        return localizedTranslation(workspace.title, lang).toLowerCase().includes(searchWorkspaceValue.toLowerCase());
    };

    const recordWorkspaceItems: ComponentProps<typeof KitSideMenu>['items'] = useMemo(
        () =>
            (application?.workspaces ?? [])
                .filter(workspace => workspace.type === 'record')
                .filter(_filterWorkspacesOnSearchValue)
                .map(recordWorkspace => {
                    const recordWorkspaceTitle = localizedTranslation(recordWorkspace.title, lang);
                    const recordWorkspaceSubTitle = localizedTranslation(recordWorkspace.subTitle, lang);

                    return {
                        key: recordWorkspace.id,
                        type: 'default',
                        title: <KitIdCard title={recordWorkspaceTitle} description={recordWorkspaceSubTitle} />,
                        tooltip: recordWorkspaceTitle,
                        icon: <KitAvatar size="s" label={recordWorkspaceTitle} shape="square" />,
                        onClick: () => {
                            navigate(generatePath(UnreachablePaths.workspace, {workspaceId: recordWorkspace.id}));
                        },
                    };
                }),
        [application?.workspaces, searchWorkspaceValue, lang],
    );

    const libraryWorkspaceItems: ComponentProps<typeof KitSideMenu>['items'] = useMemo(
        () =>
            (application?.workspaces ?? [])
                .filter(workspace => workspace.type === 'library')
                .filter(_filterWorkspacesOnSearchValue)
                .map(libraryWorkspace => {
                    // As suggested by FontAwesome documentation, we need this workaround to use the string notation
                    // More info: https://docs.fontawesome.com/web/use-with/react/add-icons#workaround
                    // @ts-expect-error: Type 'string' is not assignable to type 'IconProp'
                    const icon: IconProp = `fa-solid ${libraryWorkspace.icon ? libraryWorkspace.icon : 'fa-star-of-life'}`;

                    return {
                        key: libraryWorkspace.id,
                        type: 'default',
                        title: localizedTranslation(libraryWorkspace.title, lang),
                        icon: <FontAwesomeIcon icon={icon} />,
                        onClick: () => {
                            navigate(generatePath(UnreachablePaths.workspace, {workspaceId: libraryWorkspace.id}));
                        },
                    };
                }),
        [application?.workspaces, searchWorkspaceValue, lang],
    );

    const groupShortcutItems: ComponentProps<typeof KitSideMenu>['items'][number] = {
        type: 'group',
        title: t('workspaces_navigation_menu.shortcuts'),
        icon: <FontAwesomeIcon icon={faThumbtack} />,
    };

    const separatorItem: ComponentProps<typeof KitSideMenu>['items'][number] = {
        type: 'separator',
    };

    const noResultsItem: ComponentProps<typeof KitSideMenu>['items'][number] = {
        type: 'group',
        title: (
            <KitTypography.Text size="fontSize6" disabled>
                {t('workspaces_navigation_menu.no_results')}
            </KitTypography.Text>
        ),
    };

    const sideMenuItems = useMemo((): ComponentProps<typeof KitSideMenu>['items'] => {
        const hasRecord = recordWorkspaceItems?.length > 0;
        const hasLibrary = libraryWorkspaceItems?.length > 0;

        if (!hasRecord && !hasLibrary) {
            if (searchWorkspaceValue) {
                return [noResultsItem];
            }
            return [];
        }

        if (hasRecord && hasLibrary) {
            return [groupShortcutItems, ...recordWorkspaceItems!, separatorItem, ...libraryWorkspaceItems!];
        }

        if (hasRecord) {
            return [groupShortcutItems, ...recordWorkspaceItems!];
        }

        return [...libraryWorkspaceItems!];
    }, [recordWorkspaceItems, libraryWorkspaceItems, searchWorkspaceValue]);

    return (
        <>
            <KitSideMenu
                className={workspacesNavigationMenu}
                open={isMenuOpen}
                showSearch={showSearch}
                autoCompleteOptions={
                    showSearch
                        ? {
                              placeholder: t('workspaces_navigation_menu.search_placeholder'),
                              allowClear: true,
                              onChange: value => {
                                  setSearchWorkspaceValue(value);
                              },
                          }
                        : undefined
                }
                onOpenChanged={handleToggleMenu}
                defaultActiveItemKey={workspaceId}
                items={sideMenuItems}
            />
            <Outlet />
        </>
    );
};
