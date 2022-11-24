// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useMutation} from '@apollo/client';
import {History} from 'history';
import React from 'react';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType} from '../../../../../_gqlTypes/globalTypes';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import {IFormError} from '../../../../../_types/errors';
import {OnAttributePostSaveFunc} from '../../EditAttribute';
import InfosForm from './InfosForm';
import {AttributeInfosFormValues} from './_types';

interface IInfosTabProps {
    attribute?: GET_ATTRIBUTE_BY_ID_attributes_list;
    onPostSave?: OnAttributePostSaveFunc;
    forcedType?: AttributeType;
    history?: History;
}

function InfosTab({attribute, onPostSave, forcedType, history}: IInfosTabProps): JSX.Element {
    const [saveAttribute, {error}] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(saveAttributeQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: () => undefined,
        onCompleted: res => {
            if (history) {
                history.replace({pathname: '/attributes/edit/' + res.saveAttribute.id});
            }
        },
        update: cache => {
            // We created a new attribute, invalidate all attributes list cache
            if (!attribute) {
                cache.evict({fieldName: 'attributes'});
            }
        }
    });

    const [getAttrById, {data: dataAttrById}] = useLazyQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(
        getAttributesQuery,
        {fetchPolicy: 'no-cache'}
    );

    const _isIdUnique = async val => {
        await getAttrById({variables: {id: val}});

        return !!dataAttrById && !!dataAttrById.attributes && !dataAttrById.attributes.list.length;
    };

    const onSubmitInfos = async (dataToSave: AttributeInfosFormValues) => {
        const variables: SAVE_ATTRIBUTEVariables = {
            attrData: {
                id: dataToSave.id,
                label: {
                    fr: dataToSave.label?.fr ?? '',
                    en: dataToSave.label?.en ?? ''
                },
                description:
                    !dataToSave.description?.fr && !dataToSave.description?.en
                        ? null
                        : {
                              fr: dataToSave.description?.fr ?? '',
                              en: dataToSave.description?.en ?? ''
                          },
                type: dataToSave.type,
                format: dataToSave.format,
                readonly: dataToSave.readonly,
                linked_tree: dataToSave.linked_tree,
                linked_library: dataToSave.linked_library,
                reverse_link: dataToSave.reverse_link,
                multiple_values: dataToSave.multiple_values,
                unique: dataToSave.unique,
                versions_conf: {
                    versionable: dataToSave?.versions_conf?.versionable ?? false,
                    mode: dataToSave?.versions_conf?.mode,
                    profile: dataToSave?.versions_conf?.profile
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

    const formErrors = error?.graphQLErrors?.length ? error.graphQLErrors[0] : null;

    return (
        <InfosForm
            onSubmitInfos={onSubmitInfos}
            errors={(formErrors as unknown) as IFormError}
            attribute={attribute || null}
            readonly={false}
            onCheckIdExists={_isIdUnique}
            forcedType={forcedType}
        />
    );
}

export default InfosTab;
