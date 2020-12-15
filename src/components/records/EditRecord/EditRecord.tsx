// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/react-hooks';
import React from 'react';
import {getLibByIdQuery} from '../../../queries/libraries/getLibraryById';
import {GET_LIB_BY_ID, GET_LIB_BY_IDVariables} from '../../../_gqlTypes/GET_LIB_BY_ID';
import {TreeElementInput} from '../../../_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {RecordEdition} from '../../../_types/records';
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
    version,
    onIdentityUpdate,
    setSubmitFunc,
    onPostSave,
    inModal = false
}: IEditRecordProps): JSX.Element {
    const {data, loading, error} = useQuery<GET_LIB_BY_ID, GET_LIB_BY_IDVariables>(getLibByIdQuery, {
        variables: {id: library}
    });

    if (loading) {
        return <Loading withDimmer />;
    }

    if (error) {
        return <p className="error">ERROR</p>;
    }

    if (!data || !data.libraries || !data.libraries.list) {
        return <p>Unknown library</p>;
    }

    const lib = data.libraries.list[0];

    const attributes = lib.attributes || [];

    return (
        <>
            {recordId ? (
                <RecordEditionForm initialRecordId={recordId} library={lib} onIdentityUpdate={onIdentityUpdate} />
            ) : (
                <CreateRecordFormContainer
                    onPostSave={onPostSave}
                    attributes={attributes}
                    setSubmitFunc={setSubmitFunc}
                    library={lib}
                    inModal={inModal}
                />
            )}
        </>
    );
}

export default EditRecord;
