// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSideMenu} from 'aristid-ds';
import {useMemo, type FunctionComponent, ComponentProps, useContext} from 'react';
import {useNavigate, generatePath, useParams, Outlet} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {localizedTranslation} from '@leav/utils';
import {LangContext} from '@leav/ui';
import {Application} from '../types';
import {routes} from '../routes';
import {useApplicationMatchingMemo} from '../useApplicationMatchingMemo';
import {useWorkspacesNavigationMenu} from './useWorkspacesNavigationMenu';

interface IWorkspacesNavigationMenuProps {
    application: Application;
}

export const WorkspacesNavigationMenu: FunctionComponent<IWorkspacesNavigationMenuProps> = ({application}) => {
    const {panelId, popupPanelId, sliderPanelId} = useParams();
    const {isMenuOpen, handleToggleMenu} = useWorkspacesNavigationMenu();

    const applicationMatching = useApplicationMatchingMemo(
        application.workspaces,
        panelId,
        popupPanelId,
        sliderPanelId
    );
    const navigate = useNavigate();
    const {lang} = useContext(LangContext);

    const items: ComponentProps<typeof KitSideMenu>['items'] = useMemo(
        () =>
            application.workspaces.map(workspace => {
                // As suggested by FontAwesome documentation, we need this workaround to use the string notation
                // More info: https://docs.fontawesome.com/web/use-with/react/add-icons#workaround
                // @ts-expect-error: Type 'string' is not assignable to type 'IconProp'
                const icon: IconProp = `fa-solid ${workspace.icon ? workspace.icon : 'fa-star-of-life'}`;

                return {
                    key: workspace.id,
                    title: localizedTranslation(workspace.title, lang),
                    icon: <FontAwesomeIcon icon={icon} />,
                    onClick: () => {
                        navigate(generatePath(routes.panel, {panelId: workspace.panels?.[0]?.id ?? ''}));
                    }
                };
            }),
        [application.workspaces, lang]
    );

    return (
        <>
            <KitSideMenu
                open={isMenuOpen}
                onOpenChanged={handleToggleMenu}
                defaultActiveItemKey={applicationMatching.currentWorkspace?.id}
                items={items}
            />
            <Outlet context={applicationMatching} />
        </>
    );
};
