// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Dispatch, type SetStateAction} from 'react';
import {AntForm} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {APICallStatus, type DeleteMultipleValuesFunc} from '../../../_types';
import {DeleteAllValuesButton} from '../../shared/DeleteAllValuesButton';

interface IUseUnlinkAllRecordsProps {
    attribute: RecordFormAttributeLinkAttributeFragment;
    backendValues: RecordFormElementsValueLinkValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
    isReadOnly: boolean;
    isFieldInError: boolean;
}

export const useUnlinkAllRecords = ({
    attribute,
    backendValues,
    setBackendValues,
    onDeleteMultipleValues,
    isReadOnly,
    isFieldInError,
}: IUseUnlinkAllRecordsProps) => {
    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();

    const handleDeleteAllValues = async () => {
        const deleteRes = await onDeleteMultipleValues(
            attribute.id,
            backendValues.filter(backendValue => backendValue.id_value),
            null,
        );

        if (deleteRes.status === APICallStatus.SUCCESS) {
            form.setFieldValue(attribute.id, []);
            form.setFields([
                {
                    name: attribute.id,
                    errors: attribute.required ? [t('errors.standard_field_required')] : [],
                },
            ]);
            setBackendValues([]);
        }
    };

    const shouldDisplayUnlinkAll =
        !isReadOnly && backendValues.length > 1 && attribute.multiple_values && !attribute.required;

    return {
        UnlinkAllRecordsButton: shouldDisplayUnlinkAll && (
            <DeleteAllValuesButton handleDelete={handleDeleteAllValues} disabled={isReadOnly} danger={isFieldInError} />
        ),
    };
};
