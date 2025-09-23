// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useContext} from 'react';
import {generatePath, Navigate, Outlet, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import {KitTabs} from 'aristid-ds';
import clx from 'classnames';
import {localizedTranslation} from '@leav/utils';
import {LangContext} from '@leav/ui';
import {
    type ApplicationMatchingContextWithoutFullpageParentTuple,
    type IApplicationMatchingContext,
    type PanelLevel
} from '../types';
import {routes} from '../routes';
import {SidePanelContent} from '../../layout/SidePanelContent';
import {usePanelHeader} from './usePanelHeader';

import {content, page, pageHeader, popupPanel, scrollable, sidePanel} from './panelsNavigationMenu.module.css';

interface IPanelsNavigationMenuProps {
    level: PanelLevel;
}

export const PanelsNavigationMenu: FunctionComponent<IPanelsNavigationMenuProps> = ({level}) => {
    const {
        currentWorkspace,
        currentFullpagePanel,
        currentPopupPanel,
        currentSliderPanel,
        currentFullpageParentTuple,
        currentPopupParentTuple,
        currentSliderParentTuple
    } = useOutletContext<IApplicationMatchingContext>();
    const {lang} = useContext(LangContext);
    const {search} = useLocation();
    const navigate = useNavigate();

    const {PanelHeaderComponent, recordId} = usePanelHeader({level});

    const [panel, route, slug, parentTuple] = {
        fullpage: [currentFullpagePanel, routes.panel, 'panelId', currentFullpageParentTuple],
        popup: [currentPopupPanel, routes.popupPanel, 'popupPanelId', currentPopupParentTuple],
        slider: [currentSliderPanel, routes.sliderPanel, 'sliderPanelId', currentSliderParentTuple]
    }[level];
    if ('children' in panel) {
        return <Navigate to={generatePath(route, {[slug]: panel.children.at(0)?.id}) + search} replace />;
    }

    const tabItems: ComponentProps<typeof KitTabs>['items'] =
        parentTuple && 'children' in parentTuple[0]
            ? parentTuple[0].children.map(({id, name}) => ({
                  key: id,
                  label: localizedTranslation(name, lang)
              }))
            : [];

    const onChangeTab: ComponentProps<typeof KitTabs>['onChange'] = key => {
        const currentTab = tabItems.find(tab => tab.key === key);
        if (currentTab) {
            navigate(generatePath(route, {[slug]: currentTab.key}) + search);
        }
    };

    const pageClx = clx(page, {
        [sidePanel]: level === 'slider',
        [popupPanel]: level === 'popup'
    });

    const contentClx = clx(content, {
        [sidePanel]: level === 'slider',
        [popupPanel]: level === 'popup'
    });

    return (
        <section className={pageClx}>
            <div className={pageHeader}>
                {
                    /**
                     * `popup` is managed by `<AddModalForPopupPanel />`
                     * `slider` is managed by `<AddSidePanelForSliderPanel />`
                     */
                    level === 'fullpage' && PanelHeaderComponent
                }
                {tabItems.length !== 0 && (
                    <div className={scrollable}>
                        {/* TODO: Remove this scrollable div when KitTabs will be responsive */}
                        <KitTabs
                            items={tabItems}
                            variant="pill"
                            size="small"
                            onChange={onChangeTab}
                            activeKey={panel.id}
                        />
                    </div>
                )}
            </div>
            <div className={contentClx}>
                <Outlet
                    context={
                        {
                            currentWorkspace,
                            currentFullpagePanel,
                            currentPopupPanel,
                            currentSliderPanel,
                            currentPopupParentTuple,
                            currentSliderParentTuple,
                            recordId
                        } satisfies ApplicationMatchingContextWithoutFullpageParentTuple
                    }
                />
            </div>
            <SidePanelContent />
        </section>
    );
};
