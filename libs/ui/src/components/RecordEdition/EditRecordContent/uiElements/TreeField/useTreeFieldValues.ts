import {AntForm} from 'aristid-ds';
import {type Dispatch, type SetStateAction, useEffect, useState} from 'react';
import {type RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {arrayValueVersionToObject} from '_ui/_utils';
import {type RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type ITreeSelectionNodesById} from '_ui/hooks/useTreeSelection';
import {
    APICallStatus,
    type DeleteMultipleValuesFunc,
    type DeleteValueFunc,
    type ISubmitMultipleResult,
    type SubmitValueFunc,
} from '../../_types';

/**
 * `treeCheckStrictly` — mandatory in multiple mode, otherwise antd checks the whole subtree — makes
 * `KitTreeSelect` return `{value, label, halfChecked}` objects instead of plain ids.
 */
type TreeSelectRawValue = string | {value?: string} | null | undefined;

/**
 * Value handed over to `KitTreeSelect`. The label is carried along instead of being left to antd,
 * which resolves it from `treeData` and falls back to displaying the raw id while the tree is loading
 * (`convert2LabelValues` in `@rc-component/tree-select`).
 */
interface ITreeSelectLabeledValue {
    value: string;
    label: string;
}

export interface IUseTreeFieldValuesParams {
    attribute: RecordFormAttributeTreeAttributeFragment;
    nodesById: ITreeSelectionNodesById;
    backendValues: RecordFormElementsValueTreeValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueTreeValue[]>>;
    isFormCreationMode: boolean;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
}

export interface IUseTreeFieldValues {
    /** Value of the field, in the shape expected by `KitTreeSelect` for the current cardinality. */
    value: ITreeSelectLabeledValue | ITreeSelectLabeledValue[] | undefined;
    /** Errors raised by the last save, already set on the antd form as well. */
    errors: string[];
    handleChange: (rawValue: TreeSelectRawValue | TreeSelectRawValue[]) => Promise<void>;
}

const _toNodeIds = (rawValue: TreeSelectRawValue | TreeSelectRawValue[]): string[] => {
    const rawValues = Array.isArray(rawValue) ? rawValue : [rawValue];

    return rawValues
        .map(value => (typeof value === 'string' ? value : value?.value))
        .filter((nodeId): nodeId is string => Boolean(nodeId));
};

const _formatSubmittedValues = (result: ISubmitMultipleResult): RecordFormElementsValueTreeValue[] =>
    result.values.map(value => ({
        ...value,
        version: arrayValueVersionToObject(value.version),
        metadata: value.metadata?.map(metadata => ({
            ...metadata,
            value: {
                ...metadata.value,
                version: arrayValueVersionToObject(metadata.value.version ?? []),
            },
        })),
    })) as RecordFormElementsValueTreeValue[];

/**
 * Value layer of `TreeField`: turns what `KitTreeSelect` gives back into the submit / delete calls
 * of the record form, and keeps the antd form state in sync.
 *
 * Multiple values are saved by diff — the select hands over the whole selection, the record form API
 * works value by value.
 */
export const useTreeFieldValues = ({
    attribute,
    nodesById,
    backendValues,
    setBackendValues,
    isFormCreationMode,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
}: IUseTreeFieldValuesParams): IUseTreeFieldValues => {
    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();

    // Setting an error on the antd form does not re-render this field on its own: it is mirrored here
    const [errors, setErrors] = useState<string[]>([]);

    // Optimistic display, set synchronously on change and cleared once the backend state has been
    // synced (success or error) — see `handleChange`. `null` means "no pending change", as opposed to
    // `[]` which means "pending change to no value" (mono clear, or multi clear-all).
    const [pendingValue, setPendingValue] = useState<ITreeSelectLabeledValue[] | null>(null);

    const selectedNodes = backendValues.map(({treeValue}) => treeValue).filter(treeValue => treeValue?.id);
    const selectedNodeIds = selectedNodes.map(({id}) => id);

    // The label of the saved values comes from the record form, so it is displayed right away, without
    // waiting for the tree. Once loaded, antd takes over with the title of the matching node.
    const labeledValues = selectedNodes.map(({id, record}) => ({value: id, label: record?.whoAmI?.label || id}));

    const displayedValues = pendingValue ?? labeledValues;

    // Nodes may not be loaded yet — the tree is only fetched on the first opening of the dropdown
    const areNodesLoaded = Object.keys(nodesById).length > 0;

    const _titleToLabel = (nodeId: string): string => {
        const title = nodesById[nodeId]?.title;
        return typeof title === 'string' ? title : nodeId;
    };

    const _setFieldErrors = (fieldErrors: string[]) => {
        form.setFields([{name: attribute.id, errors: fieldErrors}]);
        setErrors(fieldErrors);
    };

    useEffect(() => {
        if (!isFormCreationMode && backendValues.length === 0 && attribute.required) {
            _setFieldErrors([t('errors.standard_field_required')]);
        }
    }, []);

    const _syncFormField = (values: RecordFormElementsValueTreeValue[]) => {
        const fieldErrors = attribute.required && values.length === 0 ? [t('errors.standard_field_required')] : [];

        form.setFieldValue(
            attribute.id,
            values.map(({treeValue}) => treeValue.id),
        );

        form.setFields([
            {
                name: attribute.id,
                errors: fieldErrors,
                touched: true, // necessary for isFieldsTouched to work properly (only for tree fields)
            },
        ]);

        setErrors(fieldErrors);
        setBackendValues(values);
    };

    const _submitNode = async (
        nodeId: string,
        idValue: string | null,
    ): Promise<RecordFormElementsValueTreeValue[] | null> => {
        const node = nodesById[nodeId];

        if (!node) {
            return null;
        }

        // When we will handle computed values, we will need to pass the active version (if still needed)
        const result = await onValueSubmit([{attribute, idValue, value: node}], null);

        if (result.status === APICallStatus.SUCCESS) {
            return _formatSubmittedValues(result);
        }

        const errorsMessage = result.errors?.map(err => `${nodesById[err.input]?.title ?? err.input}: ${err.message}`);

        _setFieldErrors(errorsMessage ?? [t('error.error_occurred')]);

        return null;
    };

    const _deleteValue = async (valueToDelete: RecordFormElementsValueTreeValue): Promise<boolean> => {
        const result = await onValueDelete({id_value: valueToDelete.id_value}, attribute.id);

        if (result.status === APICallStatus.ERROR) {
            _setFieldErrors([result.error ?? t('error.error_occurred')]);
            return false;
        }

        return true;
    };

    const _handleMonoChange = async (newNodeId?: string) => {
        if (!newNodeId) {
            if (backendValues.length === 0 || !(await _deleteValue(backendValues[0]))) {
                return;
            }

            _syncFormField([]);
            return;
        }

        // A mono-valued attribute is overridden, not added to: the existing value id is reused
        const submittedValues = await _submitNode(newNodeId, backendValues[0]?.id_value ?? null);

        if (submittedValues) {
            _syncFormField(submittedValues);
        }
    };

    const _handleMultiChange = async (newNodeIds: string[]) => {
        // Values pointing outside of the displayed tree are left untouched: they are not the ones the
        // user just unselected, they are simply not part of what this select shows. Before the tree is
        // loaded nothing is known about them, and a tag can only have been removed on purpose.
        const isOutsideDisplayedTree = (nodeId: string) => areNodesLoaded && !nodesById[nodeId];

        const removedValues = backendValues.filter(
            backendValue =>
                !isOutsideDisplayedTree(backendValue.treeValue?.id) && !newNodeIds.includes(backendValue.treeValue?.id),
        );

        if (removedValues.length > 1 && removedValues.length === backendValues.length) {
            // When we will handle computed values, we will need to pass the active version (if still needed)
            const result = await onDeleteMultipleValues(attribute.id, backendValues, null);

            if (result.status === APICallStatus.ERROR) {
                _setFieldErrors(result.errors?.map(err => err.message) ?? [t('error.error_occurred')]);
                return;
            }

            _syncFormField([]);
            return;
        }

        let updatedValues = [...backendValues];

        for (const removedValue of removedValues) {
            if (await _deleteValue(removedValue)) {
                updatedValues = updatedValues.filter(value => value.id_value !== removedValue.id_value);
            }
        }

        const addedNodeIds = newNodeIds.filter(nodeId => !selectedNodeIds.includes(nodeId));

        for (const addedNodeId of addedNodeIds) {
            const submittedValues = await _submitNode(addedNodeId, null);

            if (submittedValues) {
                updatedValues = [...updatedValues, ...submittedValues];
            }
        }

        _syncFormField(updatedValues);
    };

    const handleChange: IUseTreeFieldValues['handleChange'] = async rawValue => {
        // Defensive: `selectable: false` alone does not always prevent a node from being checked
        const newNodeIds = _toNodeIds(rawValue).filter(nodeId => nodesById[nodeId]?.selectable !== false);

        // Optimistic display: the select is fully controlled, so without this the clicked node would
        // only appear once the submit mutation (and its dependent compute refetch) resolves. Nodes are
        // known here since the tree is loaded as soon as the dropdown is open.
        setPendingValue(newNodeIds.map(nodeId => ({value: nodeId, label: _titleToLabel(nodeId)})));

        try {
            if (attribute.multiple_values) {
                await _handleMultiChange(newNodeIds);
                return;
            }

            await _handleMonoChange(newNodeIds[0]);
        } finally {
            // Runs right after `_syncFormField`'s `setBackendValues` in the same continuation, so React
            // batches both updates: no flicker between the optimistic and the synced backend value.
            setPendingValue(null);
        }
    };

    return {
        value: attribute.multiple_values ? displayedValues : displayedValues[0],
        errors,
        handleChange,
    };
};
