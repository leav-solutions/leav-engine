// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, FunctionComponent, useContext} from 'react';
import {generatePath, Outlet, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import {KitTabs} from 'aristid-ds';
import {localizedTranslation} from '@leav/utils';
import {LangContext} from '_ui/contexts';
import type {IApplicationMatchingContext} from '../types';
import {recordSearchParamsName, routes} from '../routes';
import {SidePanelContent} from '../../layout/SidePanelContent';
import {PanelIdCard} from '../PanelIdCard';

import {content, headerContent, page, pageHeader} from './panelsNavigationMenu.module.css';

export const PanelsNavigationMenu: FunctionComponent = () => {
    const {currentPanel, currentWorkspace, currentParentTuple} = useOutletContext<IApplicationMatchingContext>();
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

    return (
        <section className={page}>
            <div className={pageHeader}>
                <div className={headerContent}>
                    <PanelIdCard
                        libraryId={currentWorkspace.entrypoint.libraryId}
                        currentRecordId={searchParams.get(recordSearchParamsName)}
                    />
                </div>
                {tabItems.length !== 0 && (
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
            <SidePanelContent />
        </section>
    );
};
