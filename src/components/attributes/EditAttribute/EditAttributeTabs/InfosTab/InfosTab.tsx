import {useLazyQuery, useMutation} from '@apollo/react-hooks';
import React from 'react';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {
    GET_ATTRIBUTES,
    GET_ATTRIBUTESVariables,
    GET_ATTRIBUTES_attributes_list
} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import {onAttributePostSaveFunc} from '../../EditAttribute';
import InfosForm from './InfosForm';

interface IInfosTabProps {
    attribute?: GET_ATTRIBUTES_attributes_list;
    onPostSave?: onAttributePostSaveFunc;
}

function InfosTab({attribute, onPostSave}: IInfosTabProps): JSX.Element {
    const [saveAttribute, {error}] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(saveAttributeQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: e => undefined
    });

    const [getAttrById, {data: dataAttrById}] = useLazyQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(
        getAttributesQuery
    );

    const _isIdUnique = async val => {
        await getAttrById({variables: {id: val}});

        return !!dataAttrById && !!dataAttrById.attributes && !dataAttrById.attributes.list.length;
    };

    const onSubmitInfos = async (dataToSave: GET_ATTRIBUTES_attributes_list) => {
        const variables = {
            attrData: {
                id: dataToSave.id,
                label: {
                    fr: dataToSave.label.fr,
                    en: dataToSave.label.en
                },
                type: dataToSave.type,
                format: dataToSave.format,
                linked_tree: dataToSave.linked_tree,
                linked_library: dataToSave.linked_library,
                multiple_values: dataToSave.multiple_values,
                versions_conf: {
                    versionable: dataToSave.versions_conf ? dataToSave.versions_conf.versionable : false,
                    mode: dataToSave.versions_conf ? dataToSave.versions_conf.mode : null,
                    trees: dataToSave.versions_conf ? dataToSave.versions_conf.trees : null
                }
            }
        };
        await saveAttribute({
            variables
        });

        if (onPostSave) {
            onPostSave(dataToSave);
        }
    };

    const formErrors = error && error.graphQLErrors.length ? error.graphQLErrors[0] : null;

    return (
        <InfosForm
            onSubmitInfos={onSubmitInfos}
            errors={formErrors}
            attribute={attribute || null}
            readonly={false}
            onCheckIdExists={_isIdUnique}
        />
    );
}

export default InfosTab;
