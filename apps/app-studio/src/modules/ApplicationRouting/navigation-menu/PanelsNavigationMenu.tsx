// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, FunctionComponent, useContext} from 'react';
import {generatePath, Outlet, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import {KitTabs} from 'aristid-ds';
import cn from 'classnames';
import {localizedTranslation} from '@leav/utils';
import {LangContext} from '@leav/ui';
import type {ApplicationMatchingContextWithoutParentTuple, IApplicationMatchingContext} from '../types';
import {recordSearchParamsName, routes} from '../routes';
import {SidePanelContent} from '../../layout/SidePanelContent';
import {PanelIdCard} from './PanelIdCard';

import {content, headerContent, page, pageHeader, sidePanel} from './panelsNavigationMenu.module.css';

interface IPanelsNavigationMenuProps {
    isInSidePanel?: boolean;
}

// TODO: Later if we want a clean rendering for the modal and the slider, we would need to duplicate this component like this:
// - PanelsNavigationMenuFullPage
// - PanelsNavigationMenuPopup (+ merge AddSidePanelForPopupPanel)
// - PanelsNavigationMenuSlider (+ merge AddSidePanelForSliderPanel)
// Each component would manage the rendering correctly (example for the popup, we would display the idCard in the header of the KitModal)
export const PanelsNavigationMenu: FunctionComponent<IPanelsNavigationMenuProps> = ({isInSidePanel}) => {
    const {currentPanel, currentPopupPanel, currentSliderPanel, currentWorkspace, currentParentTuple} =
        useOutletContext<IApplicationMatchingContext>();
    const {lang} = useContext(LangContext);
    const {search} = useLocation();
    const searchParams = new URLSearchParams(search);
    const navigate = useNavigate();

    const tabItems: ComponentProps<typeof KitTabs>['items'] =
        currentParentTuple && 'children' in currentParentTuple[0]
            ? currentParentTuple[0].children.map(panel => ({
                  key: panel.id,
                  label: localizedTranslation(panel.name, lang)
              }))
            : [];

    const onChangeTab: ComponentProps<typeof KitTabs>['onChange'] = key => {
        const currentTab = tabItems.find(tab => tab.key === key);
        if (currentTab) {
            navigate(generatePath(routes.panel, {panelId: currentTab.key}) + search);
        }
    };

    // TODO: When we will adress the issue where we can't display the library name in the id card, we should move this logic to a proper component (maybe inside <PanelIdCard />)
    const tabLibraryId = currentParentTuple?.[0]?.libraryId;
    const panelLibraryId =
        currentPanel.content?.libraryId === '<props>'
            ? currentWorkspace.entrypoint.libraryId
            : currentPanel.content?.libraryId;
    const workspaceLibraryId = currentWorkspace.entrypoint.libraryId;

    const libraryId = tabLibraryId ?? panelLibraryId ?? workspaceLibraryId;

    const pageClx= cn(page, {
        [sidePanel]: isInSidePanel
    });

    const contentClx = cn(content, {
        [sidePanel]: isInSidePanel
    });

    return (
        <section className={pageClx}>
            {!isInSidePanel && (
                <div className={pageHeader}>
                    <div className={headerContent}>
                        <PanelIdCard libraryId={libraryId} currentRecordId={searchParams.get(recordSearchParamsName)} />
                    </div>
                    {tabItems.length !== 0 && (
                        <KitTabs items={tabItems} onChange={onChangeTab} defaultKey={currentPanel.id} />
                    )}
                </div>
            )}
            <div className={contentClx}>
                <Outlet
                    context={
                        {
                            currentPanel,
                            currentPopupPanel,
                            currentSliderPanel,
                            currentWorkspace
                        } satisfies ApplicationMatchingContextWithoutParentTuple
                    }
                />
            </div>
            <SidePanelContent />
        </section>
    );
};
