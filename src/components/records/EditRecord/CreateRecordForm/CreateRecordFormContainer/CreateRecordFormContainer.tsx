// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/react-hooks';
import {NetworkStatus} from 'apollo-client';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import useLang from '../../../../../hooks/useLang';
import {createRecordQuery} from '../../../../../queries/records/createRecordMutation';
import {getRecordDataQuery} from '../../../../../queries/records/recordDataQuery';
import {saveValueBatchQuery} from '../../../../../queries/values/saveValueBatchMutation';
import {isValueNull, versionObjToGraphql} from '../../../../../utils';
import {CREATE_RECORD, CREATE_RECORDVariables} from '../../../../../_gqlTypes/CREATE_RECORD';
import {
    GET_LIB_BY_ID_libraries_list,
    GET_LIB_BY_ID_libraries_list_attributes
} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import {AttributeType, TreeElementInput, ValueBatchInput} from '../../../../../_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '../../../../../_gqlTypes/RecordIdentity';
import {SAVE_VALUE_BATCH, SAVE_VALUE_BATCHVariables} from '../../../../../_gqlTypes/SAVE_VALUE_BATCH';
import {
    IGenericValue,
    IGetRecordData,
    ILinkValue,
    ITreeLinkValue,
    IValue,
    RecordData,
    RecordEdition
} from '../../../../../_types/records';
import Loading from '../../../../shared/Loading';
import CreateRecordForm from '../CreateRecordForm';

interface ICreateRecordFormContainerProps {
    library: GET_LIB_BY_ID_libraries_list;
    recordId?: string;
    attributes: GET_LIB_BY_ID_libraries_list_attributes[];
    valueVersion?: {[treeName: string]: TreeElementInput};
    onIdentityUpdate?: (identity: RecordIdentity_whoAmI) => void;
    setSubmitFunc?: RecordEdition.SetSubmitFuncRef;
    inModal?: boolean;
    onPostSave?: (record: RecordIdentity_whoAmI) => void;
}

const _extractValueToSave = (value: IGenericValue, attribute: GET_LIB_BY_ID_libraries_list_attributes) => {
    let extractedValue;

    switch (attribute.type) {
        case AttributeType.advanced_link:
        case AttributeType.simple_link:
            extractedValue =
                (value as ILinkValue).linkValue !== null ? (value as ILinkValue).linkValue!.whoAmI.id : null;
            break;
        case AttributeType.tree:
            extractedValue =
                (value as ITreeLinkValue).treeValue !== null
                    ? [
                          (value as ITreeLinkValue).treeValue!.record.whoAmI.library.id,
                          (value as ITreeLinkValue).treeValue!.record.whoAmI.id
                      ].join('/')
                    : null;
            break;
        default:
            extractedValue = (value as IValue) !== null ? (value as IValue).value : null;
            break;
    }

    return extractedValue;
};

function CreateRecordFormContainer({
    attributes,
    library,
    recordId: initialRecordId,
    valueVersion,
    onIdentityUpdate,
    setSubmitFunc,
    onPostSave,
    inModal = false
}: ICreateRecordFormContainerProps): JSX.Element {
    const attributesById = useMemo(
        () =>
            attributes.reduce((acc, attr) => {
                acc[attr.id] = attr;
                return acc;
            }, {}),
        [attributes]
    );

    const lang = useLang().lang;

    const [recordId, setRecordId] = useState<string>(initialRecordId || '');
    const [savePending, setSavePending] = useState<boolean>(false);

    const query = getRecordDataQuery(library, attributes);
    const {loading, error, data, refetch: refetchData, networkStatus} = useQuery<IGetRecordData>(query, {
        variables: {id: recordId, version: versionObjToGraphql(valueVersion || {}), lang},
        skip: !recordId || savePending,
        fetchPolicy: 'no-cache'
    });

    const [saveValueBatch, {data: dataSave}] = useMutation<SAVE_VALUE_BATCH, SAVE_VALUE_BATCHVariables>(
        saveValueBatchQuery
    );

    const [createRecord] = useMutation<CREATE_RECORD, CREATE_RECORDVariables>(createRecordQuery);

    const _extractRecordIdentity = useCallback((dataQueryRes: IGetRecordData): RecordIdentity_whoAmI => {
        return dataQueryRes && dataQueryRes.record.list[0].whoAmI
            ? dataQueryRes.record.list[0].whoAmI
            : {id: '', library: {id: '', label: null}, label: null, color: null, preview: null};
    }, []);

    useEffect(() => {
        if (onIdentityUpdate && data && data.record && data.record.list.length) {
            onIdentityUpdate(_extractRecordIdentity(data));
        }
    }, [onIdentityUpdate, _extractRecordIdentity, data, library, recordId]);

    const onSave = async (values: RecordData) => {
        setSavePending(true);

        const submittedValues = Object.keys(values)
            .filter(attrName => !!attributesById[attrName] && !attributesById[attrName].system)
            .reduce((allValues: ValueBatchInput[], attrName: string) => {
                for (const val of values[attrName]) {
                    // Don't save empty values which doesn't already exists: it means it is an empty field
                    if (val && !isValueNull(val)) {
                        const valToSave: string | null = _extractValueToSave(val, attributesById[attrName]);

                        if (valToSave !== '') {
                            allValues.push({
                                attribute: attrName,
                                id_value: val ? val.id_value : null,
                                value: valToSave
                            });
                        }
                    }
                }

                return allValues;
            }, []);

        const _executeSaveValue = (idRecord: string) => {
            return saveValueBatch({
                variables: {
                    library: library.id,
                    recordId: idRecord,
                    version: !!valueVersion ? versionObjToGraphql(valueVersion) : null,
                    values: submittedValues
                }
            });
        };

        let saveValuesRes;
        const resCreaRecord = await createRecord({
            variables: {library: library.id}
        });

        if (!!resCreaRecord && !!resCreaRecord.data) {
            setRecordId(resCreaRecord.data.createRecord.id);
            saveValuesRes = await _executeSaveValue(resCreaRecord.data.createRecord.id);
        }
        setSavePending(false);

        const freshData = await refetchData();

        if (
            onPostSave &&
            saveValuesRes?.data &&
            !saveValuesRes.data.errors &&
            !saveValuesRes.data.saveValueBatch.errors &&
            saveValuesRes.data.saveValueBatch.values
        ) {
            onPostSave(_extractRecordIdentity(freshData.data));
        }
    };

    if (error) {
        return <p className="error">ERROR</p>;
    }

    if (loading || (recordId && networkStatus !== NetworkStatus.ready)) {
        return <Loading withDimmer />;
    }

    if (recordId && (!data || !data.record || !data.record.list.length)) {
        return <p>Unknown record</p>;
    }

    const formErrors =
        dataSave && dataSave.saveValueBatch && dataSave.saveValueBatch.errors
            ? dataSave.saveValueBatch.errors.reduce((allErrors, saveError) => {
                  allErrors[saveError.attribute] = saveError;

                  return allErrors;
              }, {})
            : {};

    return (
        <CreateRecordForm
            onSave={onSave}
            attributes={attributesById}
            errors={formErrors}
            setSubmitFuncRef={setSubmitFunc}
            inModal={inModal}
        />
    );
}

export default CreateRecordFormContainer;
