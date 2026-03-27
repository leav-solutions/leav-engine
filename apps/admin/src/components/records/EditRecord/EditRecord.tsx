// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type GET_LIB_BY_ID_libraries_list,
    type GET_LIB_BY_ID_libraries_list_attributes,
} from '../../../_gqlTypes/GET_LIB_BY_ID';
import {type TreeElementInput, useGetLibByIdQuery} from '../../../_gqlTypes';
import {type RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {type RecordEdition} from '../../../_types/records';
import Loading from '../../shared/Loading';
import CreateRecordFormContainer from './CreateRecordForm/CreateRecordFormContainer';
import RecordEditionForm from './EditRecordForm';

export interface IEditRecordProps {
    library: string;
    recordId?: string;
    version?: {[treeName: string]: TreeElementInput};
    onIdentityUpdate?: (identity: RecordIdentity_whoAmI) => void;
    setSubmitFunc?: RecordEdition.SetSubmitFuncRef;
    inModal?: boolean;
    onPostSave?: (record: RecordIdentity_whoAmI) => void;
}

function EditRecord({
    library,
    recordId,
    onIdentityUpdate,
    setSubmitFunc,
    onPostSave,
    inModal = false,
}: IEditRecordProps): JSX.Element {
    const {data, loading, error} = useGetLibByIdQuery({
        variables: {id: [library]},
    });

    if (loading) {
        return <Loading withDimmer />;
    }

    if (error) {
        return <p className="error">ERROR</p>;
    }

    const lib = data?.libraries?.list?.[0];
    if (!lib) {
        return <p>Unknown library</p>;
    }

    const attributes = lib?.attributes || [];

    return (
        <>
            {recordId ? (
                <RecordEditionForm
                    initialRecordId={recordId}
                    library={lib as GET_LIB_BY_ID_libraries_list}
                    onIdentityUpdate={onIdentityUpdate}
                />
            ) : (
                <CreateRecordFormContainer
                    onPostSave={onPostSave}
                    attributes={attributes as GET_LIB_BY_ID_libraries_list_attributes[]}
                    setSubmitFunc={setSubmitFunc}
                    library={lib as GET_LIB_BY_ID_libraries_list}
                    inModal={inModal}
                />
            )}
        </>
    );
}

export default EditRecord;
