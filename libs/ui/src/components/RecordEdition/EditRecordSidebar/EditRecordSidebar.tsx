// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {MetadataSubmitValueFunc} from '../EditRecordContent/_types';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import RecordSummary from './RecordSummary';
import ValueDetails from './ValueDetails';
import ValuesVersions from './ValuesVersions';
import {themeVars} from '../../../antdTheme';
import styled from 'styled-components';
import {createPortal} from 'react-dom';
import {IEditRecordReducerState} from '../editRecordReducer/editRecordReducer';

type IEditRecordSidebarProps = {
    onMetadataSubmit: MetadataSubmitValueFunc;
    sidebarContainer?: HTMLElement;
};

const SidebarWrapper = styled.div`
    overflow-x: hidden;
    overflow-y: scroll;
    position: relative;
    grid-area: sidebar;
    background: ${themeVars.secondaryBg};
    border-top-right-radius: 3px;
    z-index: 1;
`;

const _getRecordSidebarContent = (state: IEditRecordReducerState, onMetadataSubmit: MetadataSubmitValueFunc) => {
    switch (state.sidebarContent) {
        case 'none':
            return null;
        case 'valueDetails':
            return (
                <ValueDetails
                    value={state.activeValue.value}
                    attribute={state.activeValue.attribute}
                    onMetadataSubmit={onMetadataSubmit}
                />
            );
        case 'valuesVersions':
            return <ValuesVersions />;
        default:
            return <RecordSummary record={state.record} />;
    }
};

export const EditRecordSidebar: FunctionComponent<IEditRecordSidebarProps> = ({onMetadataSubmit, sidebarContainer}) => {
    const {state} = useEditRecordReducer();
    const shouldUsePortal = sidebarContainer !== undefined;

    return shouldUsePortal ? (
        createPortal(
            <SidebarWrapper>{_getRecordSidebarContent(state, onMetadataSubmit)}</SidebarWrapper>,
            sidebarContainer
        )
    ) : (
        <SidebarWrapper>{_getRecordSidebarContent(state, onMetadataSubmit)}</SidebarWrapper>
    );
};

export default EditRecordSidebar;
