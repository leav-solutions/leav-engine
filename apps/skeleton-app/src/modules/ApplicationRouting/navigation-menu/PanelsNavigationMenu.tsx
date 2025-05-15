// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, FunctionComponent} from 'react';
import {generatePath, Outlet, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import {KitIdCard, KitTabs} from 'aristid-ds';
import type {IApplicationMatchingContext} from '../types';
import {routes} from '../routes';

import {content, headerContent, page, pageHeader} from './panelsNavigationMenu.module.css';
import {InitSidePanel} from '../../../config/sidePanel/InitSidePanel';

export const PanelsNavigationMenu: FunctionComponent = () => {
    const {currentPanel, currentWorkspace, currentParentTuple} = useOutletContext<IApplicationMatchingContext>();
    const {search} = useLocation();
    const navigate = useNavigate();

    const tabItems: ComponentProps<typeof KitTabs>['items'] =
        currentParentTuple && 'children' in currentParentTuple[0]
            ? currentParentTuple[0].children.map(panel => ({
                  key: panel.id,
                  label: panel.id // TODO: replace with name
              }))
            : [];

    const onChangeTab: ComponentProps<typeof KitTabs>['onChange'] = key => {
        const currentTab = tabItems.find(tab => tab.key === key);
        if (currentTab) {
            navigate(generatePath(routes.panel, {panelId: currentTab.key}) + search);
        }
    };

    return (
        <section className={page}>
            <InitSidePanel>
                <div className={pageHeader}>
                    <div className={headerContent}>
                        <KitIdCard size="large" title={currentPanel.id} />
                    </div>
                    {tabItems != null && (
                        <KitTabs items={tabItems} onChange={onChangeTab} defaultKey={currentPanel.id} />
                    )}
                </div>
                <div className={content}>
                    <Outlet
                        context={
                            {currentPanel, currentWorkspace} satisfies Omit<
                                IApplicationMatchingContext,
                                'currentParentTuple'
                            >
                        }
                    />
                </div>
            </InitSidePanel>
        </section>
    );
};
