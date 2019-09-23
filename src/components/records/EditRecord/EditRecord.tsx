import {useQuery} from '@apollo/react-hooks';
import React from 'react';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from '../../../_gqlTypes/GET_LIBRARIES';
import {TreeElementInput} from '../../../_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {RecordEdition} from '../../../_types/records';
import Loading from '../../shared/Loading';
import EditRecordFormContainer from './EditRecordFormContainer';

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
    // Get attributes
    // TODO: handle error
    const {data, loading, error} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery, {
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
        <EditRecordFormContainer
            library={lib}
            recordId={recordId}
            valueVersion={version}
            attributes={attributes}
            onIdentityUpdate={onIdentityUpdate}
            setSubmitFunc={setSubmitFunc}
            inModal={inModal}
            onPostSave={onPostSave}
        />
    );
}

export default EditRecord;
