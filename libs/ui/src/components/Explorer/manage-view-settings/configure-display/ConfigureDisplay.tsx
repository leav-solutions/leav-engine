// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import styled from 'styled-components';
import {RadioGroupProps} from 'aristid-ds/dist/Kit/DataEntry/Radio';
import {ViewSettingsActionTypes} from './../store-view-settings/viewSettingsReducer';
import {useViewSettingsContext} from './../store-view-settings/useViewSettingsContext';
import {SelectVisibleAttributes} from './attributes/SelectVisibleAttributes';
import {SelectViewType} from './view-type/SelectViewType';

const StyledWrapperDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-l) * 1px);

    .ant-radio-wrapper {
        padding: calc(var(--general-spacing-xs) * 1px);
    }
`;

interface IConfigureDisplayProps {
    libraryId: string;
}

export const ConfigureDisplay: FunctionComponent<IConfigureDisplayProps> = ({libraryId}) => {
    const {view, dispatch} = useViewSettingsContext();

    const _handleViewTypeChange: RadioGroupProps['onChange'] = event => {
        dispatch({type: ViewSettingsActionTypes.UPDATE_VIEW_LIST_BUTTON_LABEL, payload: true});
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_VIEW_TYPE,
            payload: {
                viewType: event.target.value
            }
        });
    };

    return (
        <StyledWrapperDiv>
            <SelectViewType value={view.viewType} onChange={_handleViewTypeChange} />
            {view.viewType === 'table' && <SelectVisibleAttributes libraryId={libraryId} />}
        </StyledWrapperDiv>
    );
};
