import React from 'react';
import {GET_LIBRARIES_libraries_list} from '../../../../_gqlTypes/GET_LIBRARIES';
import {RecordIdentity_whoAmI} from '../../../../_gqlTypes/RecordIdentity';
import EditRecordForm from './EditRecordForm';

interface IEditRecordFormProps {
    initialRecordId?: string;
    library: GET_LIBRARIES_libraries_list;
    setRecordIdentity?: (input: React.SetStateAction<RecordIdentity_whoAmI | undefined>) => void;
    onIdentityUpdate?: any;
}

function EditRecordFormContainer({
    initialRecordId,
    library,
    setRecordIdentity,
    onIdentityUpdate
}: IEditRecordFormProps): JSX.Element {
    const attributes = library && library.attributes ? library.attributes : [];

    const formErrors = {};

    return (
        <EditRecordForm
            attributes={attributes}
            errors={formErrors}
            inModal
            library={library}
            onIdentityUpdate={onIdentityUpdate}
            initialRecordId={initialRecordId}
            setRecordIdentity={setRecordIdentity}
        />
    );
}

export default EditRecordFormContainer;
