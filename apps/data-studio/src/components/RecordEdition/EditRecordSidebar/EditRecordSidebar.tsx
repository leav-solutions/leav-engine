// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import RecordSummary from 'components/shared/RecordSummary';
import {MetadataSubmitValueFunc} from '../EditRecord/_types';
import {useEditRecordModalReducer} from '../editRecordModalReducer/useEditRecordModalReducer';
import ValueDetails from './ValueDetails';
import ValuesVersions from './ValuesVersions';

interface IEditRecordSidebarProps {
    onMetadataSubmit: MetadataSubmitValueFunc;
}

function EditRecordSidebar({onMetadataSubmit}: IEditRecordSidebarProps): JSX.Element {
    const {state} = useEditRecordModalReducer();

    switch (state.sidebarContent) {
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
