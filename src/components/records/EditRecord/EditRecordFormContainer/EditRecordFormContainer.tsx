import {useMutation, useQuery} from '@apollo/react-hooks';
import {NetworkStatus} from 'apollo-client';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {createRecordQuery} from '../../../../queries/records/createRecordMutation';
import {getRecordDataQuery} from '../../../../queries/records/recordDataQuery';
import {saveValueBatchQuery} from '../../../../queries/values/saveValueBatchMutation';
import {versionObjToGraphql} from '../../../../utils/utils';
import {CREATE_RECORD, CREATE_RECORDVariables} from '../../../../_gqlTypes/CREATE_RECORD';
import {
    GET_LIBRARIES_libraries_list,
    GET_LIBRARIES_libraries_list_attributes
} from '../../../../_gqlTypes/GET_LIBRARIES';
import {AttributeType, TreeElementInput, ValueBatchInput} from '../../../../_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '../../../../_gqlTypes/RecordIdentity';
import {SAVE_VALUE_BATCH, SAVE_VALUE_BATCHVariables} from '../../../../_gqlTypes/SAVE_VALUE_BATCH';
import {
    IGenericValue,
    IGetRecordData,
    ILinkValue,
    ITreeLinkValue,
    IValue,
    RecordData,
    RecordEdition
} from '../../../../_types/records';
import useLang from '../../../../__mocks__/useLang';
import Loading from '../../../shared/Loading';
import EditRecordForm from './EditRecordForm';

interface IEditRecordFormContainerProps {
    library: GET_LIBRARIES_libraries_list;
    recordId?: string;
    attributes: GET_LIBRARIES_libraries_list_attributes[];
    valueVersion?: {[treeName: string]: TreeElementInput};
    onIdentityUpdate?: (identity: RecordIdentity_whoAmI) => void;
    setSubmitFunc?: RecordEdition.SetSubmitFuncRef;
    inModal?: boolean;
    onPostSave?: (record: RecordIdentity_whoAmI) => void;
}

const _extractValueToSave = (value: IGenericValue, attribute: GET_LIBRARIES_libraries_list_attributes) => {
    let extractedValue;

    switch (attribute.type) {
        case AttributeType.advanced_link:
        case AttributeType.simple_link:
            extractedValue = (value as ILinkValue).value !== null ? (value as ILinkValue).value!.whoAmI.id : null;
            break;
        case AttributeType.tree:
            extractedValue =
                (value as ITreeLinkValue).value !== null
                    ? [
                          (value as ITreeLinkValue).value!.record.whoAmI.library.id,
                          (value as ITreeLinkValue).value!.record.whoAmI.id
                      ].join('/')
                    : null;
            break;
        default:
            extractedValue = (value as IValue).value;
            break;
    }

    return extractedValue;
};

function EditRecordFormContainer({
    attributes,
    library,
    recordId: initialRecordId,
    valueVersion,
    onIdentityUpdate,
    setSubmitFunc,
    onPostSave,
    inModal = false
}: IEditRecordFormContainerProps): JSX.Element {
    const attributesById = useMemo(
        () =>
            attributes.reduce((acc, attr) => {
                acc[attr.id] = attr;
                return acc;
            }, {}),
        [attributes]
    );
    const lang = useLang();

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
                if (attributesById[attrName].multiple_values) {
                    // Multiple values
                    for (const val of values[attrName] as IGenericValue[]) {
                        // Don't save empty values which doesn't already exists: it means it is an empty field
                        if (val && (val.id_value || (!val.id_value && val.value !== null))) {
                            const valToSave: string | null = _extractValueToSave(val, attributesById[attrName]);

                            allValues.push({
                                attribute: attrName,
                                id_value: val ? val.id_value : null,
                                value: valToSave
                            });
                        }
                    }
                } else {
                    const valToSave = _extractValueToSave(values[attrName] as IGenericValue, attributesById[attrName]);

                    allValues.push({
                        attribute: attrName,
                        id_value: values[attrName] ? (values[attrName] as IGenericValue).id_value : null,
                        value: valToSave
                    });
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
        if (!recordId) {
            const resCreaRecord = await createRecord({
                variables: {library: library.id}
            });

            if (!!resCreaRecord && !!resCreaRecord.data) {
                setRecordId(resCreaRecord.data.createRecord.id);
                saveValuesRes = await _executeSaveValue(resCreaRecord.data.createRecord.id);
            }
        } else {
            saveValuesRes = await _executeSaveValue(recordId);
        }
        setSavePending(false);

        const freshData = await refetchData();

        if (
            onPostSave &&
            saveValuesRes &&
            saveValuesRes.data &&
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

    const recordData: RecordData = recordId
        ? Object.keys(data!.record.list[0]).reduce((cleanData, fieldName) => {
              if (fieldName !== '__typename') {
                  cleanData[fieldName] = data!.record.list[0][fieldName];

                  if (formErrors[fieldName] && formErrors[fieldName].input) {
                      cleanData[fieldName].value = formErrors[fieldName].input;
                  }
              }
              return cleanData;
          }, {})
        : {};

    return (
        <EditRecordForm
            recordData={recordData}
            onSave={onSave}
            attributes={attributes}
            errors={formErrors}
            setSubmitFuncRef={setSubmitFunc}
            inModal={inModal}
        />
    );
}

export default EditRecordFormContainer;
