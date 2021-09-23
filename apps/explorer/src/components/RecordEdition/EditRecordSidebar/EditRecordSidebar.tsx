// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import RecordSummary from 'components/shared/RecordSummary';
import React from 'react';
import ValueDetails from '../EditRecord/shared/ValueDetails';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';

function EditRecordSidebar(): JSX.Element {
    const {state} = useEditRecordReducer();

    return state.activeValue ? (
        <ValueDetails value={state.activeValue.value} attribute={state.activeValue.attribute} />
    ) : (
        <RecordSummary record={state.record} />
    );
}

export default EditRecordSidebar;
