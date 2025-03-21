// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {SelectTreeNodeModal} from './SelectTreeNodeModal';
import {RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {ITreeNodeWithRecord} from '_ui/types';
import {APICallStatus, DeleteMultipleValuesFunc, DeleteValueFunc, SubmitValueFunc} from '../../../_types';
import {arrayValueVersionToObject} from '_ui/_utils';
import {DeleteAllValuesButton} from '../../shared/DeleteAllValuesButton';
import {AntForm} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IUseManageTreeNodeSelectionProps {
    modaleTitle: string;
    attribute: RecordFormAttributeTreeAttributeFragment;
    backendValues: RecordFormElementsValueTreeValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueTreeValue[]>>;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
    isReadOnly: boolean;
    isFieldInError: boolean;
}

export const useManageTreeNodeSelection = ({
    modaleTitle,
    attribute,
    backendValues,
    setBackendValues,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    isReadOnly,
    isFieldInError
}: IUseManageTreeNodeSelectionProps) => {
    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();

    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        if (backendValues.length === 0 && attribute.required) {
            // Set field in error when TreeField is displayed for the first time. Otherwise, errors will be handled by other functions in this file.
            form.setFields([
                {
                    name: attribute.id,
                    errors: [t('errors.standard_field_required')]
                }
            ]);
        }
    }, []);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const addTreeNodes = async (selectedNodes: ITreeNodeWithRecord[]) => {
        const valuesToSave = selectedNodes.map(node => ({
            attribute,
            idValue: null,
            value: node
        }));

        // When we will handle computed values, we will need to passe the active version (if still needed)
        const result = await onValueSubmit(valuesToSave, null);

        if (!attribute.multiple_values && backendValues.length > 0) {
            // As we can't replace a single value, we need to remove the previous one
            await removeTreeNode(backendValues[0], true);
        }

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

    const removeTreeNode = async (nodeValue: RecordFormElementsValueTreeValue, skipAfterRemove: boolean = false) => {
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
                        attribute.required && newBackendValues.length === 0 ? [t('errors.standard_field_required')] : []
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
    };

    const removeAllTreeNodes = async () => {
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

    const getActionButtonLabel = () => {
        if (!attribute.multiple_values && backendValues.length > 0) {
            return `${t('global.replace')} ${modaleTitle}`;
        }

        return `${t('global.add')} ${modaleTitle}`;
    };

    return {
        openModal,
        removeTreeNode,
        actionButtonLabel: getActionButtonLabel(),
        SelectTreeNodeModal: isModalVisible ? (
            <SelectTreeNodeModal
                open
                title={modaleTitle}
                attribute={attribute}
                backendValues={backendValues}
                onConfirm={addTreeNodes}
                onClose={closeModal}
            />
        ) : null,
        RemoveAllTreeNodes:
            backendValues.length > 1 && attribute.multiple_values && !attribute.required ? (
                <DeleteAllValuesButton
                    handleDelete={removeAllTreeNodes}
                    disabled={isReadOnly}
                    danger={isFieldInError}
                />
            ) : null
    };
};
