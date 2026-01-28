// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitIdCard, KitTag} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SettingsPanel} from '../router-menu/SettingsPanel';
import {useEditSettings} from './useEditSettings';
import {type SettingsPanelPages} from './EditSettingsContext';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {type ReactElement, useEffect, useState} from 'react';
import {type IViewSettingsState} from '../store-view-settings/viewSettingsReducer';
import styled from 'styled-components';
import {type FeatureHook} from '../../_types';
import {MASS_SELECTION_ALL} from '../../_constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBars, faSlidersH} from '@fortawesome/free-solid-svg-icons';

const ModifiedStyledKitTag = styled(KitTag)`
    margin: 0;
`;

interface IChangePanelPage {
    pageName: SettingsPanelPages;
    title: string;
    onClickLeftButton?: () => void;
}

export const useOpenViewSettings = ({view, isEnabled = true}: FeatureHook<{view: IViewSettingsState}>) => {
    const {activeSettings, setActiveSettings, closeSettingsPanel} = useEditSettings();
    const [button, setButton] = useState<ReactElement | null>(null);
    const [viewListButton, setViewListButton] = useState<ReactElement | null>(null);

    const {t} = useSharedTranslation();
    const {lang} = useLang();

    useEffect(() => {
        if (!isEnabled) {
            closeSettingsPanel();
        }
        return () => {
            closeSettingsPanel();
        };
    }, [isEnabled]);

    const rootPanel = {pageName: 'router-menu', title: t('explorer.settings')} as const;

    const _changePanelPage = ({pageName, title, onClickLeftButton}: IChangePanelPage) => {
        setActiveSettings({
            ...activeSettings!,
            content: <SettingsPanel library={view.libraryId} page={pageName} />,
            title,
            onClickLeftButton,
        });
    };

    const _openSettingsPanel = (pageName: SettingsPanelPages = 'router-menu') => {
        const chanelPageParams: IChangePanelPage = {
            pageName,
            title: t(`explorer.${pageName}`),
        };
        if (pageName !== rootPanel.pageName) {
            chanelPageParams.onClickLeftButton = () => {
                _changePanelPage(rootPanel);
            };
        }

        _changePanelPage(chanelPageParams);
    };

    const viewName = localizedTranslation(view?.viewLabels ?? {}, lang);
    const isMassSelectionAll = view.massSelection === MASS_SELECTION_ALL;

    useEffect(() => {
        setButton(
            <KitButton
                type="secondary"
                size="m"
                icon={<FontAwesomeIcon icon={faSlidersH} />}
                onClick={() => _openSettingsPanel()}
                disabled={isMassSelectionAll}
                title={String(t('explorer.settings')) /* TODO: avoid transform null to 'null' */}
            />,
        );
        setViewListButton(
            <KitButton
                type="secondary"
                size="m"
                icon={<FontAwesomeIcon icon={faBars} />}
                onClick={() => _openSettingsPanel('viewList.my-views')}
                disabled={isMassSelectionAll}
                title={String(t('explorer.viewList.manage-views')) /* TODO: avoid transform null to 'null' */}
            >
                {viewName === '' ? t('explorer.viewList.manage-views') : viewName}
                {view.viewModified && (
                    <ModifiedStyledKitTag type="error">
                        <KitIdCard description={String(t('explorer.modified'))} />
                    </ModifiedStyledKitTag>
                )}
            </KitButton>,
        );
    }, [view.viewModified, viewName, isMassSelectionAll]);

    return {
        openSettingsPanel: _openSettingsPanel,
        viewSettingsButton: button,
        viewListButton,
        viewName: viewName === '' ? t('explorer.viewList.default-view') : viewName,
    };
};
