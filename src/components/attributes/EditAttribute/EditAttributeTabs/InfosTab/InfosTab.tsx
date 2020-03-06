import {useLazyQuery, useMutation} from '@apollo/react-hooks';
import React from 'react';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {
    GET_ATTRIBUTES,
    GET_ATTRIBUTESVariables,
    GET_ATTRIBUTES_attributes_list
} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType} from '../../../../../_gqlTypes/globalTypes';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import {onAttributePostSaveFunc} from '../../EditAttribute';
import InfosForm from './InfosForm';
import {clearCacheQueriesFromRegexp} from '../../../../../utils';
import {History} from 'history';
// import useLang from '../../../../../hooks/useLang';

interface IInfosTabProps {
    attribute?: GET_ATTRIBUTES_attributes_list;
    onPostSave?: onAttributePostSaveFunc;
    forcedType?: AttributeType;
    history?: History;
}

function InfosTab({attribute, onPostSave, forcedType, history}: IInfosTabProps): JSX.Element {
    // const {lang} = useLang();
    const [saveAttribute, {error}] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(saveAttributeQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: e => undefined,
        update: async (cache, {data: dataCached}) => {
            const newAttribute = dataCached.saveAttribute;
            const cachedData: any = cache.readQuery({query: getAttributesQuery, variables: {id: newAttribute.id}});

            clearCacheQueriesFromRegexp(cache, /ROOT_QUERY.attributes/);

            const newAttributes = {
                totalCount: 1,
                list: [newAttribute],
                __typename: cachedData.attributes.__typename
            };

            cache.writeQuery({
                query: getAttributesQuery,
                data: {attributes: newAttributes},
                variables: {id: newAttribute.id}
            });

            if (history) {
                history.replace({pathname: '/attributes/edit/' + newAttribute.id});
            }
        }
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
            forcedType={forcedType}
        />
    );
}

export default InfosTab;
