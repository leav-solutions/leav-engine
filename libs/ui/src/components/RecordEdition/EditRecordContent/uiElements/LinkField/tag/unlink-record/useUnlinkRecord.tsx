// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {APICallStatus, type DeleteValueFunc} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {type RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useConfirmModal} from '_ui/hooks/useConfirmModal/useConfirmModal';
import {BREAK_TWO_LINES} from '_ui/constants';
import {AntForm} from 'aristid-ds';
import {type Dispatch, type SetStateAction} from 'react';

interface IUseUnlinkRecordProps {
    attribute: RecordFormAttributeLinkAttributeFragment;
    backendValues: RecordFormElementsValueLinkValue[];
    isReadOnly: boolean;
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
    onValueDelete: DeleteValueFunc;
}
export const useUnlinkRecord = ({
    attribute,
    backendValues,
    isReadOnly,
    setBackendValues,
    onValueDelete,
}: IUseUnlinkRecordProps) => {
    const {t} = useSharedTranslation();
    const {openConfirmModal} = useConfirmModal();
    const antdForm = AntForm.useFormInstance();

    const handleUnlinkRecord = async (idValue: string) => {
        const deleteRes = await onValueDelete({id_value: idValue}, attribute.id);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            setBackendValues(previousBackendValues =>
                previousBackendValues.filter(backendValue => backendValue.id_value !== idValue),
            );
        }

        if (deleteRes.status === APICallStatus.ERROR) {
            antdForm.setFields([
                {
                    name: attribute.id,
                    errors: [deleteRes.error],
                },
            ]);
        }
    };

    const canUnlinkRecord = !isReadOnly && (!attribute.required || (attribute.required && backendValues.length > 1));

    return {
        canUnlinkRecord,
        unlinkRecord: (idValue: string) =>
            openConfirmModal({
                title: t('record_edition.delete_link'),
                content: t('record_edition.delete_link_description') + BREAK_TWO_LINES + t('global.are_you_sure'),
                onOk: async () => {
                    await handleUnlinkRecord(idValue);
                },
            }),
    };
};
