// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton} from 'aristid-ds';
import {FaSave, FaShare, FaUndo} from 'react-icons/fa';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import {useSaveView} from './useSaveView';
import styled from 'styled-components';

const FooterStyledDiv = styled.footer`
    display: flex;
    flex-direction: column;
    padding-bottom: calc(var(--general-spacing-xs) * 1px);
`;

export const ViewActions = () => {
    const {t} = useSharedTranslation();

    const {view, dispatch} = useViewSettingsContext();
    const {saveViewModal, toggleModal} = useSaveView();

    const _handleReinitView = () => {
        dispatch({type: ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS});
    };
    return (
        <FooterStyledDiv>
            {saveViewModal}
            <KitButton type="redirect" icon={<FaSave />} onClick={toggleModal}>
                {t('explorer.save-view')}
            </KitButton>
            <KitButton type="redirect" icon={<FaShare />} onClick={() => null}>
                {t('explorer.share-view')}
            </KitButton>
            <KitButton type="redirect" icon={<FaUndo />} onClick={_handleReinitView}>
                {t('explorer.reinit-view')}
            </KitButton>
        </FooterStyledDiv>
    );
};
