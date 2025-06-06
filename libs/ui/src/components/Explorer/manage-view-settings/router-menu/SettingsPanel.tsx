// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {FunctionComponent} from 'react';
import {KitInput, KitTypography} from 'aristid-ds';
import {FaFilter, FaList, FaSortAlphaDown} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ConfigureDisplay} from '../configure-display/ConfigureDisplay';
import {SortItems} from '../sort-items/SortItems';
import {SettingItem} from './SettingItem';
import {FilterItems} from '../filter-items/FilterItems';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {SettingsPanelPages} from '../open-view-settings/EditSettingsContext';
import {useOpenViewSettings} from '../open-view-settings/useOpenViewSettings';
import {SavedViews} from '../../list-saved-views/SavedViews';
import {ViewActionsButtons} from '../save-view/ViewActionsButtons';

const ContentWrapperStyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
`;

const ViewNameStyledKitInput = styled(KitInput)`
    margin-bottom: calc(var(--general-spacing-s) * 1px);
`;

const ConfigurationStyledMenu = styled.menu`
    padding: 0;
`;

interface ISettingsPanelProps {
    library: string;
    page?: SettingsPanelPages;
}

export const SettingsPanel: FunctionComponent<ISettingsPanelProps> = ({library, page = 'router-menu'}) => {
    const {t} = useSharedTranslation();

    const {view} = useViewSettingsContext();
    const {openSettingsPanel, viewName} = useOpenViewSettings({view, isEnabled: true});

    // TODO: look for MemoryRouter
    return (
        <ContentWrapperStyledDiv>
            {page === 'router-menu' && (
                <>
                    <nav>
                        <ViewNameStyledKitInput disabled value={viewName} />
                        <KitTypography.Title level="h4">{t('explorer.router-menu')}</KitTypography.Title>
                        <ConfigurationStyledMenu>
                            <SettingItem
                                icon={<FaList />}
                                title={t('explorer.configure-display')}
                                onClick={() => openSettingsPanel('configure-display')}
                            />
                            {view.entrypoint.type === 'library' && (
                                <>
                                    <SettingItem
                                        icon={<FaFilter />}
                                        title={t('explorer.filters')}
                                        value={String(t('explorer.active-items-number', {count: view.filters.length}))}
                                        onClick={() => openSettingsPanel('filter-items')}
                                    />
                                    <SettingItem
                                        icon={<FaSortAlphaDown />}
                                        title={t('explorer.sort-items')}
                                        onClick={() => openSettingsPanel('sort-items')}
                                    />
                                </>
                            )}
                        </ConfigurationStyledMenu>
                    </nav>
                    <ViewActionsButtons />
                </>
            )}
            {page === 'configure-display' && <ConfigureDisplay libraryId={library} />}
            {page === 'sort-items' && <SortItems libraryId={library} />}
            {page === 'filter-items' && <FilterItems libraryId={library} />}
            {page === 'viewList.my-views' && <SavedViews />}
        </ContentWrapperStyledDiv>
    );
};
