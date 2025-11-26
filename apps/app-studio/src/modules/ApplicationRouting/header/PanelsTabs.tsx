// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useContext} from 'react';
import {KitTabs} from 'aristid-ds';
import {generatePath, useNavigate} from 'react-router-dom';
import {localizedTranslation} from '@leav/utils';
import {LangContext} from '@leav/ui';
import cn from 'classnames';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {AbsolutePaths, RelativePaths} from '../router/paths';

import {scrollable} from './panelsTabs.module.css';

interface IPanelsTabsProps {
    enabled: boolean;
    workspaceId: string;
    recordId: string | undefined;
    where: string | undefined;
    libraryId: string | null;
    panelType: string | null;
    flapRecordId: string | undefined;
    flapLibraryId: string | undefined;
    flapPanelId: string | undefined;
    currentPanelId: string;
    className?: string;
}

export const PanelsTabs: FunctionComponent<IPanelsTabsProps> = ({
    enabled,
    workspaceId,
    recordId,
    where,
    libraryId,
    panelType,
    flapRecordId,
    flapLibraryId,
    flapPanelId,
    currentPanelId,
    className,
}) => {
    const [application] = useApplicationSettingsContext();
    const {lang} = useContext(LangContext);
    const navigate = useNavigate();

    const isRecordPanel = recordId !== undefined;

    const hasFlapAlreadyOpen = flapPanelId !== undefined;

    const tabItems: ComponentProps<typeof KitTabs>['items'] =
        libraryId === null || panelType === null
            ? []
            : application.libraries[libraryId][panelType]
                  .filter(panel => !panel.isStandalone && !(where === 'slider' && panel.hideInSlider))
                  .map(panel => ({
                      key: panel.id,
                      label: localizedTranslation(panel.name, lang),
                  }));

    const onChangeTab: ComponentProps<typeof KitTabs>['onChange'] = key => {
        const currentTab = tabItems.find(tab => tab.key === key);

        if (!currentTab) {
            return;
        }

        if (hasFlapAlreadyOpen) {
            return navigate(
                // Navigation between record panels should be historized in url
                generatePath(
                    RelativePaths.closeFlapPanel +
                        '/' +
                        RelativePaths.closeCurrentPanel +
                        '/' +
                        RelativePaths.nextLevelPanel,

                    {
                        recordId,
                        where,
                        recordPanelId: currentTab.key,
                    },
                ),
                {relative: 'path'},
            );
        }

        if (isRecordPanel) {
            return navigate(
                // Navigation between record panels should be historized in url
                generatePath(RelativePaths.changeLastRecordPanel, {
                    recordPanelId: currentTab.key,
                }),
                {relative: 'path'},
            );
        }

        // Navigation between library panels should not be historized in url
        // Case of workspace directly into a record
        return navigate(generatePath(AbsolutePaths.panel, {workspaceId, panelId: currentTab.key}));
    };

    return (
        enabled &&
        tabItems.length > 1 && (
            <div className={cn(scrollable, className)}>
                {/* TODO: Remove this scrollable div when KitTabs will be responsive */}
                <KitTabs
                    items={tabItems}
                    variant="pill"
                    size="xsmall"
                    onChange={onChangeTab}
                    activeKey={currentPanelId}
                />
            </div>
        )
    );
};
