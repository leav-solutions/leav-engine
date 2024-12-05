// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {FunctionComponent, useState} from 'react';
import {KitTypography} from 'aristid-ds';
import {FaFilter, FaList, FaSortAlphaDown} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useEditSettings} from '../open-view-settings/useEditSettings';
import {ConfigureDisplay} from '../configure-display/ConfigureDisplay';
import {SortItems} from '../sort-items/SortItems';
import {SettingItem} from './SettingItem';
import {FilterItems} from '../filter-items/FilterItems';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';

export type SettingsPanelPages = 'router-menu' | 'configure-display' | 'sort-items' | 'filter-items';

const ContentWrapperStyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-s) * 1px);
`;

const ConfigurationStyledMenu = styled.menu`
    padding: 0;
`;

interface ISettingsPanelProps {
    library: string;
    maxFilters: number;
}

export const SettingsPanel: FunctionComponent<ISettingsPanelProps> = ({library, maxFilters}) => {
    const {t} = useSharedTranslation();

    const {setActiveSettings, activeSettings} = useEditSettings();
    const {
        view: {filter}
    } = useViewSettingsContext();

    const [currentPage, setCurrentPage] = useState<SettingsPanelPages>('router-menu');

    const _goToAdvancedSettingsPage = (page: SettingsPanelPages) => {
        if (!activeSettings) {
            throw Error('Should not be able to change side pane page if there is no side panel!');
        }

        const _changePanelPage = ({
            pageName,
            title,
            onClickLeftButton
        }: {
            pageName: SettingsPanelPages;
            title: string;
            onClickLeftButton?: () => void;
        }) => {
            setCurrentPage(pageName);
            setActiveSettings({
                ...activeSettings!,
                title,
                onClickLeftButton
            });
        };

        _changePanelPage({
            pageName: page,
            title: t(`explorer.${page}`),
            onClickLeftButton: () => {
                const rootPanel = {pageName: 'router-menu', title: t('explorer.settings')} as const;
                _changePanelPage(rootPanel);
            }
        });
    };

    // TODO: look for MemoryRouter

    return (
        <ContentWrapperStyledDiv>
            {currentPage === 'router-menu' && (
                <nav>
                    <KitTypography.Title level="h4">{t('explorer.router-menu')}</KitTypography.Title>
                    <ConfigurationStyledMenu>
                        <SettingItem
                            icon={<FaList />}
                            title={t('explorer.configure-display')}
                            onClick={() => _goToAdvancedSettingsPage('configure-display')}
                        />
                        <SettingItem
                            icon={<FaFilter />}
                            title={t('explorer.filters')}
                            value={String(t('explorer.active-items-number', {count: filter.length}))}
                            onClick={() => _goToAdvancedSettingsPage('filter-items')}
                        />
                        <SettingItem
                            icon={<FaSortAlphaDown />}
                            title={t('explorer.sort-items')}
                            onClick={() => _goToAdvancedSettingsPage('sort-items')}
                        />
                    </ConfigurationStyledMenu>
                </nav>
            )}
            {currentPage === 'configure-display' && <ConfigureDisplay libraryId={library} />}
            {currentPage === 'sort-items' && <SortItems libraryId={library} />}
            {currentPage === 'filter-items' && <FilterItems libraryId={library} maxFilters={maxFilters} />}
        </ContentWrapperStyledDiv>
    );
};
