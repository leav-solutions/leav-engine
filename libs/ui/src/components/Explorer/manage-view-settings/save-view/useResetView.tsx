// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import {FaUndo} from 'react-icons/fa';

export const useResetView = () => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();

    const _resetView = () => {
        dispatch({type: ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS});
    };

    return {
        resetViewButton: (
            <KitButton type="redirect" icon={<FaUndo />} onClick={_resetView}>
                {t('explorer.reinit-view')}
            </KitButton>
        )
    };
};
