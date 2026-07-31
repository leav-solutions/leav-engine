import {useNavigate} from 'react-router-dom';
import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {type AttributeType, useGetAttributesLazyQuery, useSaveAttributeMutation} from '../../../../../_gqlTypes';
import {type SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import {type IFormError} from '../../../../../_types/errors';
import {type OnAttributePostSaveFunc} from '../../EditAttribute';
import InfosForm from './InfosForm';
import {type AttributeInfosFormValues} from './_types';

interface IInfosTabProps {
    attribute?: GET_ATTRIBUTE_BY_ID_attributes_list;
    onPostSave?: OnAttributePostSaveFunc;
    forcedType?: AttributeType;
    redirectAfterCreate?: boolean;
}

function InfosTab({attribute, onPostSave, forcedType, redirectAfterCreate = true}: IInfosTabProps): JSX.Element {
    const navigate = useNavigate();
    const isNewAttribute = !attribute;
    const [saveAttribute, {error}] = useSaveAttributeMutation({
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: () => undefined,
        onCompleted: res => {
            if (isNewAttribute && redirectAfterCreate) {
                navigate('/attributes/edit/' + res.saveAttribute.id, {replace: true});
            }
        },
        update: cache => {
            // We created a new attribute, invalidate all attributes list cache
            if (!attribute) {
                cache.evict({fieldName: 'attributes'});
            }
        },
    });

    const [getAttrById, {data: dataAttrById}] = useGetAttributesLazyQuery({fetchPolicy: 'no-cache'});

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
                    en: dataToSave.label?.en ?? '',
                },
                description:
                    !dataToSave.description?.fr && !dataToSave.description?.en
                        ? null
                        : {
                              fr: dataToSave.description?.fr ?? '',
                              en: dataToSave.description?.en ?? '',
                          },
                type: dataToSave.type,
                format: dataToSave.format,
                character_limit: Number(dataToSave.character_limit) || null,
                readonly: dataToSave.readonly,
                required: dataToSave.required,
                linked_tree: dataToSave.linked_tree,
                linked_library: dataToSave.linked_library,
                reverse_link: dataToSave.reverse_link,
                multiple_values: dataToSave.multiple_values,
                unique: dataToSave.unique,
                versions_conf: {
                    versionable: dataToSave?.versions_conf?.versionable ?? false,
                    mode: dataToSave?.versions_conf?.mode,
                    profile: dataToSave?.versions_conf?.profile,
                },
                smart_filter:
                    (dataToSave.smart_filter && {
                        enable: dataToSave.smart_filter.enable ?? false,
                    }) ||
                    null,
            },
        };

        await saveAttribute({
            variables,
        });

        if (onPostSave) {
            onPostSave(dataToSave);
        }
    };

    const formErrors = error?.graphQLErrors?.length ? error.graphQLErrors[0] : null;

    return (
        <InfosForm
            onSubmitInfos={onSubmitInfos}
            errors={formErrors as unknown as IFormError}
            attribute={attribute || null}
            readonly={false}
            onCheckIdExists={_isIdUnique}
            forcedType={forcedType}
        />
    );
}

export default InfosTab;
