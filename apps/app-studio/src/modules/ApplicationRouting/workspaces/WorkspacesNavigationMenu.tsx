import {KitAvatar, KitIdCard, KitSideMenu, KitTypography} from 'aristid-ds';
import {useMemo, useState, type ComponentProps, useContext} from 'react';
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
import {matomo} from '../../../services/analytics';
import {matomoEvents} from '../../../services/analytics/constants/matomoEvents';

export const WorkspacesNavigationMenu = () => {
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
                            matomo.trackNavigationEvent(
                                matomoEvents.actions.workspace_clicked,
                                recordWorkspaceTitle || recordWorkspace.id,
                            );
                            navigate(generatePath(UnreachablePaths.workspace, {workspaceId: recordWorkspace.id}));
                        },
                    };
                }),
        [application?.workspaces, searchWorkspaceValue, lang],
    );

    // Library and tree workspaces are both flat menu entry points with the same item shape (icon +
    // title + navigate to workspace). They are kept in a single list, so the alphabetical order mixing
    // both types (computed by the core) is preserved in the menu.
    const flatWorkspaceItems: ComponentProps<typeof KitSideMenu>['items'] = useMemo(
        () =>
            (application?.workspaces ?? [])
                .filter(workspace => workspace.type === 'library' || workspace.type === 'tree')
                .filter(_filterWorkspacesOnSearchValue)
                .map(flatWorkspace => {
                    // As suggested by FontAwesome documentation, we need this workaround to use the string notation
                    // More info: https://docs.fontawesome.com/web/use-with/react/add-icons#workaround
                    // @ts-expect-error: Type 'string' is not assignable to type 'IconProp'
                    const icon: IconProp = `fa-solid ${flatWorkspace.icon ? flatWorkspace.icon : 'fa-star-of-life'}`;
                    const flatWorkspaceTitle = localizedTranslation(flatWorkspace.title, lang);

                    return {
                        key: flatWorkspace.id,
                        type: 'default',
                        title: flatWorkspaceTitle,
                        icon: <FontAwesomeIcon icon={icon} />,
                        onClick: () => {
                            matomo.trackNavigationEvent(
                                matomoEvents.actions.workspace_clicked,
                                flatWorkspaceTitle || flatWorkspace.id,
                            );
                            navigate(generatePath(UnreachablePaths.workspace, {workspaceId: flatWorkspace.id}));
                        },
                    };
                }),
        [application?.workspaces, searchWorkspaceValue, lang],
    );

    const groupShortcutItems: ComponentProps<typeof KitSideMenu>['items'][number] = {
        type: 'group',
        title: t('workspaces_navigation_menu.shortcuts'),
        icon: <FontAwesomeIcon icon={faThumbtack} size="sm" />,
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
        const hasFlatWorkspace = flatWorkspaceItems?.length > 0;

        if (!hasRecord && !hasFlatWorkspace) {
            if (searchWorkspaceValue) {
                return [noResultsItem];
            }
            return [];
        }

        if (hasRecord && hasFlatWorkspace) {
            return [groupShortcutItems, ...recordWorkspaceItems!, separatorItem, ...flatWorkspaceItems!];
        }

        if (hasRecord) {
            return [groupShortcutItems, ...recordWorkspaceItems!];
        }

        return [...flatWorkspaceItems!];
    }, [recordWorkspaceItems, flatWorkspaceItems, searchWorkspaceValue]);

    return (
        <>
            <KitSideMenu
                className={workspacesNavigationMenu}
                open={isMenuOpen}
                showSearch={showSearch}
                searchOptions={
                    showSearch
                        ? {
                              placeholder: t('workspaces_navigation_menu.search_placeholder'),
                              allowClear: true,
                              onChange: value => {
                                  setSearchWorkspaceValue(value.target.value);
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
