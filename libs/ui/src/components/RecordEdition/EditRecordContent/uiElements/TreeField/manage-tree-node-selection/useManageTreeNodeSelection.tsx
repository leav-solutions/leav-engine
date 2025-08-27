// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, Dispatch, SetStateAction, useEffect, useState} from 'react';
import {AntForm} from 'aristid-ds';
import {ChildrenAsRecordValuePermissionFilterInput, RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {arrayValueVersionToObject} from '_ui/_utils';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {APICallStatus, DeleteMultipleValuesFunc, DeleteValueFunc, SubmitValueFunc} from '../../../_types';
import {DeleteAllValuesButton} from '../../shared/DeleteAllValuesButton';
import {SelectTreeNodeModal} from './SelectTreeNodeModal';

interface IUseManageTreeNodeSelectionProps {
    modaleTitle: string;
    attribute: RecordFormAttributeTreeAttributeFragment;
    isFormCreationMode: boolean;
    backendValues: RecordFormElementsValueTreeValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueTreeValue[]>>;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
    isReadOnly: boolean;
    isFieldInError: boolean;
    childrenAsRecordValuePermissionFilter?: ChildrenAsRecordValuePermissionFilterInput;
}

export const useManageTreeNodeSelection = ({
    modaleTitle,
    attribute,
    isFormCreationMode,
    backendValues,
    setBackendValues,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    isReadOnly,
    isFieldInError,
    childrenAsRecordValuePermissionFilter
}: IUseManageTreeNodeSelectionProps) => {
    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();

    const [isModalHidden, setIsModalHidden] = useState(true);

    // Used to force the input error display when a value is set
    AntForm.useWatch(attribute.id, form);

    useEffect(() => {
        if (!isFormCreationMode && backendValues.length === 0 && attribute.required) {
            form.setFields([{name: attribute.id, errors: [t('errors.standard_field_required')]}]);
        }
    }, []);

    const _closeModal: ComponentProps<typeof SelectTreeNodeModal>['onClose'] = () => {
        setIsModalHidden(true);
    };

    const _addTreeNodes: ComponentProps<typeof SelectTreeNodeModal>['onConfirm'] = async selectedNodes => {
        const valuesToSave = selectedNodes.map(node => ({
            attribute,
            idValue: !attribute.multiple_values && backendValues.length > 0 ? backendValues[0].id_value : null,
            value: node
        }));

        // When we will handle computed values, we will need to passe the active version (if still needed)
        const result = await onValueSubmit(valuesToSave, null);

        if (result.status === APICallStatus.SUCCESS) {
            const formattedValues: RecordFormElementsValueTreeValue[] = result.values.map(value => ({
                ...value,
                version: arrayValueVersionToObject(value.version),
                metadata: value.metadata?.map(metadata => ({
                    ...metadata,
                    value: {
                        ...metadata.value,
                        version: arrayValueVersionToObject(metadata.value.version ?? [])
                    }
                }))
            }));

            const updatedValues = attribute.multiple_values
                ? [...backendValues, ...formattedValues]
                : [...formattedValues];

            form.setFieldValue(attribute.id, [...updatedValues.map(({treeValue}) => treeValue.id)]);

            form.setFields([
                {
                    name: attribute.id,
                    errors: []
                }
            ]);

            setBackendValues(updatedValues);
        }

        if (result.status === APICallStatus.ERROR) {
            const selectedNodesById = selectedNodes.reduce((acc, cur) => ({...acc, [cur.id]: cur}), {});

            const errorsMessage = result.errors?.map(err => {
                const linkedRecordLabel = selectedNodesById[err.input].title || selectedNodesById[err.input].id;

                return `${linkedRecordLabel}: ${err.message}`;
            });

            form.setFields([
                {
                    name: attribute.id,
                    errors: errorsMessage ?? [t('error.error_occurred')]
                }
            ]);
        }
    };

    const _removeAllTreeNodes: ComponentProps<typeof DeleteAllValuesButton>['handleDelete'] = async () => {
        // When we will handle computed values, we will need to passe the active version (if still needed)
        const result = await onDeleteMultipleValues(attribute.id, backendValues, null);

        if (result.status === APICallStatus.SUCCESS) {
            form.setFieldValue(attribute.id, []);
            form.setFields([
                {
                    name: attribute.id,
                    errors: attribute.required ? [t('errors.standard_field_required')] : []
                }
            ]);
            setBackendValues([]);
        }

        if (result.status === APICallStatus.ERROR) {
            const errorsMessage = result.errors?.map(err => err.message);

            form.setFields([
                {
                    name: attribute.id,
                    errors: errorsMessage ?? [t('error.error_occurred')]
                }
            ]);
        }
    };

    const label = `${t(!attribute.multiple_values && backendValues.length > 0 ? 'global.replace' : 'global.add')} ${modaleTitle}`;

    return {
        openModal: () => {
            setIsModalHidden(false);
        },
        removeTreeNode: async (nodeValue: RecordFormElementsValueTreeValue, skipAfterRemove: boolean = false) => {
            const result = await onValueDelete({id_value: nodeValue.id_value}, attribute.id);

            if (skipAfterRemove) {
                return;
            }

            if (result.status === APICallStatus.SUCCESS) {
                const newBackendValues = backendValues.filter(value => value.id_value !== nodeValue.id_value);

                form.setFieldValue(
                    attribute.id,
                    newBackendValues.map(({treeValue}) => treeValue.id)
                );

                form.setFields([
                    {
                        name: attribute.id,
                        errors:
                            attribute.required && newBackendValues.length === 0
                                ? [t('errors.standard_field_required')]
                                : []
                    }
                ]);

                setBackendValues(newBackendValues);
            }

            if (result.status === APICallStatus.ERROR) {
                form.setFields([
                    {
                        name: attribute.id,
                        errors: [t('error.error_occurred')]
                    }
                ]);
            }
        },
        actionButtonLabel: label,
        SelectTreeNodeModal: isModalHidden ? null : (
            <SelectTreeNodeModal
                open
                title={label}
                attribute={attribute}
                backendValues={backendValues}
                onConfirm={_addTreeNodes}
                onClose={_closeModal}
                childrenAsRecordValuePermissionFilter={childrenAsRecordValuePermissionFilter}
            />
        ),
        RemoveAllTreeNodes:
            backendValues.length > 1 && attribute.multiple_values && !attribute.required ? (
                <DeleteAllValuesButton
                    handleDelete={_removeAllTreeNodes}
                    disabled={isReadOnly}
                    danger={isFieldInError}
                />
            ) : null
    };
};
