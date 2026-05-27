import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    type JoinLibraryContextFragment,
    type ExplorerSelectionIdsQuery,
    type RecordFormAttributeLinkAttributeFragment,
} from '_ui/_gqlTypes';
import {LINK_RECORDS_MODAL_CLASSNAME} from '_ui/components/Explorer/_constants';
import {
    APICallStatus,
    type ISubmitMultipleResult,
    type SubmitValueFunc,
} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {SelectRecordForLinkModal} from '_ui/components/SelectRecordForLinkModal';
import {AntForm, KitButton, KitTooltip} from 'aristid-ds';
import {type Dispatch, type SetStateAction, useState} from 'react';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SelectTreeNodeModal} from '../../../TreeField/manage-tree-node-selection/SelectTreeNodeModal';

interface IUseLinkRecordProps {
    attribute: RecordFormAttributeLinkAttributeFragment;
    isReadOnly: boolean;
    onValueSubmit: SubmitValueFunc;
    backendValues: RecordFormElementsValueLinkValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
    joinLibraryContext?: JoinLibraryContextFragment;
}

export const useLinkRecord = ({
    attribute,
    isReadOnly,
    onValueSubmit,
    backendValues,
    setBackendValues,
    joinLibraryContext,
}: IUseLinkRecordProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {t} = useSharedTranslation();
    const antdForm = AntForm.useFormInstance();

    const _buildValueToSubmit = (recordId: string) => ({
        id: recordId,
        whoAmI: {id: recordId, library: {id: attribute.linked_library?.id}},
    });

    const _handleLinkRecord = async (data: ExplorerSelectionIdsQuery) => {
        let submitRes: ISubmitMultipleResult;

        if (attribute.multiple_values) {
            submitRes = await onValueSubmit(
                data.records.list.map(record => ({value: _buildValueToSubmit(record.id), idValue: null, attribute})),
                null,
            );
        } else {
            submitRes = await onValueSubmit(
                [
                    {
                        value: _buildValueToSubmit(data.records.list[0].id),
                        idValue: backendValues[0]?.id_value ?? null,
                        attribute,
                    },
                ],
                null,
            );
        }

        if (submitRes.status === APICallStatus.SUCCESS) {
            const linkValues = submitRes.values as unknown as RecordFormElementsValueLinkValue[];

            if (attribute.multiple_values) {
                setBackendValues(previousBackendValues => [...previousBackendValues, ...linkValues]);
            } else {
                setBackendValues([linkValues[0]]);
            }
        }

        if (submitRes.status === APICallStatus.ERROR) {
            antdForm.setFields([
                {
                    name: attribute.id,
                    errors: [submitRes.error],
                },
            ]);
        }
    };

    const isReplacementMode = backendValues.length > 0 && !attribute.multiple_values;

    const linkedLibraryId =
        joinLibraryContext &&
        'linked_library' in joinLibraryContext.mandatoryAttribute &&
        joinLibraryContext.mandatoryAttribute.linked_library?.id;

    const linkedTreeId =
        joinLibraryContext &&
        'linked_tree' in joinLibraryContext.mandatoryAttribute &&
        joinLibraryContext.mandatoryAttribute.linked_tree?.id;

    const isValuesListEnabled = attribute.linkValuesList?.enable;

    const valuesList = isValuesListEnabled ? attribute.linkValuesList?.values?.map(value => value.id) : undefined;

    const allowFreeEntry = isValuesListEnabled ? Boolean(attribute.linkValuesList?.allowFreeEntry) : true;

    return {
        LinkRecordButton: !isReadOnly ? (
            <>
                <KitTooltip title={isReplacementMode ? t('global.replace') : t('global.add')}>
                    <KitButton
                        type="secondary"
                        size="m"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                    />
                </KitTooltip>
                {linkedTreeId ? (
                    <SelectTreeNodeModal
                        open={isModalOpen}
                        attribute={{
                            multiple_values: attribute.multiple_values,
                            linked_tree: {
                                id: linkedTreeId,
                            },
                        }}
                        title={t(
                            attribute.multiple_values ? 'tree-node-selection.title_many' : 'tree-node-selection.title',
                        )}
                        // We can select new node(s), ignoring current value(s).
                        // Selected element might be duplicated in link attribute in backend for now.
                        backendValues={[]}
                        onClose={() => setIsModalOpen(false)}
                        onConfirm={async selectedNodes => {
                            const nodeIds = selectedNodes.map(node => node.id);
                            await _handleLinkRecord({records: {list: nodeIds.map(id => ({id}))}});
                        }}
                    />
                ) : (
                    <SelectRecordForLinkModal
                        className={LINK_RECORDS_MODAL_CLASSNAME}
                        open={isModalOpen}
                        childLibraryId={linkedLibraryId || attribute.linked_library?.id}
                        onSelectionCompleted={async data => {
                            await _handleLinkRecord(data);
                            setIsModalOpen(false);
                        }}
                        columnsToDisplay={[]} // TODO: One day, we should be able to choose the columns to display from a given viewId
                        replacementMode={isReplacementMode}
                        selectionMode={!attribute.multiple_values ? 'simple' : 'multiple'}
                        hideSelectAllAction={!attribute.multiple_values}
                        valuesList={valuesList}
                        allowFreeEntry={allowFreeEntry}
                        isMultivalue={attribute.multiple_values}
                        onClose={() => setIsModalOpen(false)}
                        joinLibraryContext={joinLibraryContext}
                    />
                )}
            </>
        ) : undefined,
    };
};
