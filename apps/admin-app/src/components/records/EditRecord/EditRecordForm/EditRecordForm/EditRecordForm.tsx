// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {NetworkStatus} from 'apollo-client';
import React, {useCallback, useEffect} from 'react';
import useLang from '../../../../../hooks/useLang';
import {getRecordDataQuery} from '../../../../../queries/records/recordDataQuery';
import {deleteValueQuery} from '../../../../../queries/values/deleteValueMutation';
import {saveValueQuery} from '../../../../../queries/values/saveValueMutation';
import {isLinkAttribute, versionObjToGraphql} from '../../../../../utils';
import {isLinkValue, isTreeValue} from '../../../../../utils/utils';
import {DELETE_VALUE, DELETE_VALUEVariables} from '../../../../../_gqlTypes/DELETE_VALUE';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {
    GET_LIB_BY_ID_libraries_list,
    GET_LIB_BY_ID_libraries_list_attributes
} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import {ValueInput} from '../../../../../_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '../../../../../_gqlTypes/RecordIdentity';
import {SAVE_VALUE, SAVE_VALUEVariables} from '../../../../../_gqlTypes/SAVE_VALUE';
import {SAVE_VALUE_BATCH_saveValueBatch_errors} from '../../../../../_gqlTypes/SAVE_VALUE_BATCH';
import {IGetRecordData, ILinkValue, ITreeLinkValue, IValue, RecordData} from '../../../../../_types/records';
import Loading from '../../../../shared/Loading';
import LinksField from '../../../FormFields/LinksField';
import StandardValuesWrapper from './StandardValuesWrapper';

interface IEditRecordFormProps {
    attributes: GET_LIB_BY_ID_libraries_list_attributes[];
    errors?: IEditRecordFormError;
    inModal?: boolean;
    library: GET_LIB_BY_ID_libraries_list;
    valueVersion?: {[treeName: string]: string};
    onIdentityUpdate?: any;
    initialRecordId?: string;
    setRecordIdentity?: (input: React.SetStateAction<RecordIdentity_whoAmI | undefined>) => void;
}

export interface IEditRecordFormError {
    [fieldName: string]: SAVE_VALUE_BATCH_saveValueBatch_errors;
}

const EditRecordForm = ({
    attributes,
    onIdentityUpdate,
    errors = {},
    inModal = false,
    library,
    valueVersion,
    initialRecordId,
    setRecordIdentity
}: IEditRecordFormProps): JSX.Element => {
    const lang = useLang().lang;

    const recordId = initialRecordId === undefined ? '' : initialRecordId;

    const query = getRecordDataQuery(library, attributes);
    const getRecordDataVariables = {id: recordId, version: versionObjToGraphql(valueVersion || null), lang};

    const {loading, error, data, networkStatus} = useQuery<IGetRecordData>(query, {
        variables: getRecordDataVariables,
        skip: !recordId
    });

    const [deleteValueMutation] = useMutation<DELETE_VALUE, DELETE_VALUEVariables>(deleteValueQuery, {
        refetchQueries: [{query, variables: getRecordDataVariables}]
    });

    const [saveValueMutation] = useMutation<SAVE_VALUE, SAVE_VALUEVariables>(saveValueQuery, {
        refetchQueries: [{query, variables: getRecordDataVariables}]
    });

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

    if (error) {
        return <p className="error">ERROR ${error.message}</p>;
    }

    if (loading || (recordId && networkStatus !== NetworkStatus.ready)) {
        return <Loading withDimmer />;
    }

    if (recordId && (!data || !data.record || !data.record.list.length)) {
        return <p>Unknown record</p>;
    }

    const recordData: RecordData = recordId
        ? Object.keys(data!.record.list[0]).reduce((cleanData, fieldName) => {
              if (fieldName !== '__typename') {
                  cleanData[fieldName] = data!.record.list[0][fieldName];
              }
              return cleanData;
          }, {})
        : {};

    if (setRecordIdentity) {
        setRecordIdentity(recordData.whoAmI);
    }

    const _submitValue = attribute => (value: ValueInput) =>
        saveValueMutation({
            variables: {
                library: library.id,
                recordId,
                attribute: attribute.id,
                value
            }
        });

    const _deleteValue = attribute => (value: ValueInput) => {
        deleteValueMutation({
            variables: {
                library: library.id,
                recordId,
                attribute: attribute.id,
                valueId: value.id_value
            }
        });
    };

    const _getInput = (attribute: GET_LIB_BY_ID_libraries_list_attributes) => {
        const values = recordData[attribute.id];

        if (isLinkAttribute(attribute as GET_ATTRIBUTES_attributes_list, false)) {
            const _handleLinkChange = (value: ILinkValue | ITreeLinkValue) => {
                if (
                    (isLinkValue(value) && value.linkValue === null) ||
                    (isTreeValue(value) && value.treeValue === null)
                ) {
                    return _deleteValue(attribute)({id_value: value.id_value, value: null});
                }

                const savedValue = {
                    id_value: value.id_value,
                    value: isTreeValue(value)
                        ? `${value.treeValue?.record.whoAmI.library.id}/${value.treeValue?.record.whoAmI.id}`
                        : (value as ILinkValue)!.linkValue?.id
                };

                return _submitValue(attribute)(savedValue);
            };

            return (
                <LinksField
                    key={attribute.id}
                    values={values as ILinkValue[] | ITreeLinkValue[]}
                    attribute={attribute}
                    readonly={attribute.system}
                    onChange={_handleLinkChange}
                />
            );
        }

        return (
            <StandardValuesWrapper
                key={attribute.id}
                values={values as IValue[]}
                attribute={attribute}
                readonly={attribute.system}
                onSubmit={_submitValue(attribute)}
                onDelete={_deleteValue(attribute)}
            />
        );
    };

    return <>{attributes && attributes.map(attr => _getInput(attr))}</>;
};

export default EditRecordForm;
