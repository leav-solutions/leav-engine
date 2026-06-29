import {type SetStateAction} from 'react';
import {type GET_LIB_BY_ID_libraries_list} from '../../../../_gqlTypes/GET_LIB_BY_ID';
import {type RecordIdentity_whoAmI} from '../../../../_gqlTypes/RecordIdentity';
import EditRecordForm from './EditRecordForm';

interface IEditRecordFormProps {
    initialRecordId?: string;
    library: GET_LIB_BY_ID_libraries_list;
    setRecordIdentity?: (input: SetStateAction<RecordIdentity_whoAmI | undefined>) => void;
    onIdentityUpdate?: any;
}

function EditRecordFormContainer({
    initialRecordId,
    library,
    setRecordIdentity,
    onIdentityUpdate,
}: IEditRecordFormProps): JSX.Element {
    const attributes = library?.attributes ?? [];

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
