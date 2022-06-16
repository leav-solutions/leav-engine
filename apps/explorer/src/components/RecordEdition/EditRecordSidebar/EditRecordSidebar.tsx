// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import RecordSummary from 'components/shared/RecordSummary';
import React from 'react';
import {MetadataSubmitValueFunc} from '../EditRecord/_types';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import ValueDetails from './ValueDetails';

interface IEditRecordSidebarProps {
    onMetadataSubmit: MetadataSubmitValueFunc;
}

function EditRecordSidebar({onMetadataSubmit}: IEditRecordSidebarProps): JSX.Element {
    const {state} = useEditRecordReducer();

    return state.activeValue ? (
        <ValueDetails
            value={state.activeValue.value}
            attribute={state.activeValue.attribute}
            onMetadataSubmit={onMetadataSubmit}
        />
    ) : (
        <RecordSummary record={state.record} />
    );
}

export default EditRecordSidebar;
