// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {FunctionComponent} from 'react';
import {KitButton, KitTypography} from 'aristid-ds';
import {FaFilter, FaList, FaSave, FaSortAlphaDown, FaUndo} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ConfigureDisplay} from '../configure-display/ConfigureDisplay';
import {SortItems} from '../sort-items/SortItems';
import {SettingItem} from './SettingItem';
import {FilterItems} from '../filter-items/FilterItems';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';
import {useLang} from '_ui/hooks';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import {SettingsPanelPages} from '../open-view-settings/EditSettingsContext';
import {useOpenViewSettings} from '../open-view-settings/useOpenViewSettings';
import {isExplorerFilterThrough} from '../../_types';

const ContentWrapperStyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-s) * 1px);
    justify-content: space-between;
    height: 100%;
`;

const FooterStyledDiv = styled.footer`
    display: flex;
    justify-content: center;
    gap: calc(var(--general-spacing-xs) * 1px);
    padding: calc(var(--general-spacing-xxs) * 1px) 0;
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
    const {defaultLang} = useLang();

    const {openSettingsPanel} = useOpenViewSettings(library);
    const {view, dispatch} = useViewSettingsContext();

    const {saveView} = useExecuteSaveViewMutation();

    const _handleSaveView = () => {
        //TODO: handle "through" filters
        saveView({
            view: {
                id: view.viewId,
                library,
                shared: false,
                display: {
                    type: mapViewTypeFromExplorerToLegacy[view.viewType]
                },
                filters: view.filters.map(filter => ({
                    field: isExplorerFilterThrough(filter) ? `${filter.field}.${filter.subField}` : filter.field,
                    value: filter.value,
                    condition: isExplorerFilterThrough(filter) ? filter.subCondition : filter.condition
                })),
                sort: view.sort.map(({field: attributeId, order}) => ({field: attributeId, order})),
                attributes: view.attributesIds,
                label: {
                    //TODO: add a better label when view management is more advanced
                    [defaultLang]: 'user view'
                }
            }
        });
    };

    const _handleReinitView = () => {
        dispatch({type: ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS});
    };

    // TODO: look for MemoryRouter
    return (
        <ContentWrapperStyledDiv>
            {page === 'router-menu' && (
                <>
                    <nav>
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
                    <FooterStyledDiv>
                        <KitButton type="secondary" danger icon={<FaUndo />} onClick={_handleReinitView}>
                            {t('explorer.reinit-view')}
                        </KitButton>
                        <KitButton type="primary" icon={<FaSave />} onClick={_handleSaveView}>
                            {t('explorer.save-view')}
                        </KitButton>
                    </FooterStyledDiv>
                </>
            )}
            {page === 'configure-display' && <ConfigureDisplay libraryId={library} />}
            {page === 'sort-items' && <SortItems libraryId={library} />}
            {page === 'filter-items' && <FilterItems libraryId={library} />}
        </ContentWrapperStyledDiv>
    );
};
