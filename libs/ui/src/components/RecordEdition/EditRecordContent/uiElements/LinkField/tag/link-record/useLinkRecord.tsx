// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {type ExplorerSelectionIdsQuery, type RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {LINK_RECORDS_MODAL_CLASSNAME} from '_ui/components/Explorer/_constants';
import {
    APICallStatus,
    type ISubmitMultipleResult,
    type SubmitValueFunc,
} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {SelectRecordForLinkModal} from '_ui/components/SelectRecordForLinkModal';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';
import {AntForm, KitButton, KitTooltip} from 'aristid-ds';
import {type Dispatch, type SetStateAction, useState} from 'react';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IUseLinkRecordProps {
    attribute: RecordFormAttributeLinkAttributeFragment;
    isReadOnly: boolean;
    onValueSubmit: SubmitValueFunc;
    backendValues: RecordFormElementsValueLinkValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
}

export const useLinkRecord = ({
    attribute,
    isReadOnly,
    onValueSubmit,
    backendValues,
    setBackendValues,
}: IUseLinkRecordProps) => {
    const [isSelectRecordForLinkModalOpen, setIsSelectRecordForLinkModalOpen] = useState(false);
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

    return {
        LinkRecordButton: !isReadOnly ? (
            <>
                <KitTooltip
                    title={isReplacementMode ? t('global.replace') : t('global.add')}
                    mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}
                >
                    <KitButton
                        type="secondary"
                        size="m"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => {
                            setIsSelectRecordForLinkModalOpen(true);
                        }}
                    />
                </KitTooltip>
                <SelectRecordForLinkModal
                    className={LINK_RECORDS_MODAL_CLASSNAME}
                    open={isSelectRecordForLinkModalOpen}
                    childLibraryId={attribute.linked_library?.id}
                    onSelectionCompleted={async data => {
                        await _handleLinkRecord(data);
                        setIsSelectRecordForLinkModalOpen(false);
                    }}
                    columnsToDisplay={[]} // TODO: One day, we should be able to choose the columns to display from a given viewId
                    replacementMode={isReplacementMode}
                    selectionMode={!attribute.multiple_values ? 'simple' : 'multiple'}
                    hideSelectAllAction={true}
                    valuesList={attribute.linkValuesList?.values?.map(value => value.id)}
                    allowFreeEntry={attribute.linkValuesList?.allowFreeEntry}
                    isMultivalue={attribute.multiple_values}
                    onClose={() => setIsSelectRecordForLinkModalOpen(false)}
                />
            </>
        ) : undefined,
    };
};
