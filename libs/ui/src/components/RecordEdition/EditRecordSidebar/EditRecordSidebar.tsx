// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MetadataSubmitValueFunc} from '../EditRecordContent/_types';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import RecordSummary from './RecordSummary';
import ValueDetails from './ValueDetails';
import ValuesVersions from './ValuesVersions';

interface IEditRecordSidebarProps {
    onMetadataSubmit: MetadataSubmitValueFunc;
}

function EditRecordSidebar({onMetadataSubmit}: IEditRecordSidebarProps): JSX.Element {
    const {state} = useEditRecordReducer();

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
}

export default EditRecordSidebar;
