// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import {useFiltersContext} from '_ui/components/Filters/useFiltersContext';
import {FiltersActionTypes} from '_ui/components/Filters/context/filtersReducer';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUndo} from '@fortawesome/free-solid-svg-icons';

export const useResetView = () => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();
    const {dispatch: filtersDispatch} = useFiltersContext();

    const _resetView = () => {
        dispatch({type: ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS});
        filtersDispatch({type: FiltersActionTypes.RESTORE_INITIAL_VIEW_SETTINGS});
    };

    return {
        resetViewButton: (
            <KitButton type="action" icon={<FontAwesomeIcon icon={faUndo} />} onClick={_resetView}>
                {t('explorer.viewList.reinit-view')}
            </KitButton>
        ),
    };
};
