// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFilterInput, RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {APICallStatus, DeleteMultipleValuesFunc, ISubmitMultipleResult} from '../../../_types';
import {Dispatch, SetStateAction} from 'react';
import {IItemData, MassSelection} from '_ui/components/Explorer/_types';
import {AntForm} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {ErrorTypes} from '@leav/utils';

interface IUseLinkRecordsProps {
    attribute: RecordFormAttributeLinkAttributeFragment;
    backendValues: RecordFormElementsValueLinkValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
}

export const useLinkRecords = ({
    attribute,
    backendValues,
    setBackendValues,
    onDeleteMultipleValues
}: IUseLinkRecordsProps) => {
    const {t} = useSharedTranslation();

    const form = AntForm.useFormInstance();

    const removeValues = (filterFn?: (id: string) => boolean) => {
        if (!filterFn) {
            form.setFieldValue(attribute.id, []);
            form.setFields([
                {
                    name: attribute.id,
                    errors: attribute.required ? [t('errors.standard_field_required')] : []
                }
            ]);
            setBackendValues([]);
            return;
        }

        const newBackendValues = backendValues.filter(backendValue => filterFn(backendValue.linkValue.id));

        form.setFieldValue(
            attribute.id,
            newBackendValues.map(({linkValue}) => linkValue.id)
        );

        form.setFields([
            {
                name: attribute.id,
                errors: attribute.required && newBackendValues.length === 0 ? [t('errors.standard_field_required')] : []
            }
        ]);

        setBackendValues(previousBackendValues =>
            previousBackendValues.filter(backendValue => filterFn(backendValue.linkValue.id))
        );
    };

    const handleDeleteAllValues = async () => {
        const deleteRes = await onDeleteMultipleValues(
            attribute.id,
            backendValues.filter(backendValue => backendValue.id_value),
            null
        );

        if (deleteRes.status === APICallStatus.SUCCESS) {
            removeValues();
        }
    };

    const handleExplorerRemoveValue = (item: IItemData) => {
        removeValues(id => id !== item.itemId);
    };

    const handleExplorerMassDeactivateValues = (
        _massSelectedFilter: RecordFilterInput[],
        massSelection: MassSelection
    ) => {
        removeValues(id => !massSelection.includes(id));
    };

    const handleExplorerLinkValue = (saveValuesResult: ISubmitMultipleResult) => {
        if (saveValuesResult.status === APICallStatus.SUCCESS) {
            const saveLinkValues = saveValuesResult.values as unknown as RecordFormElementsValueLinkValue[];

            form.setFieldValue(attribute.id, [
                ...backendValues.map(({linkValue}) => linkValue.id),
                ...saveLinkValues.map(({linkValue}) => linkValue.id)
            ]);

            form.setFields([
                {
                    name: attribute.id,
                    errors: []
                }
            ]);

            setBackendValues([...backendValues, ...saveLinkValues]);
        }

        if (saveValuesResult.status === APICallStatus.ERROR && saveValuesResult.errors) {
            const attributeError = saveValuesResult.errors.filter(err => err.attribute === attribute.id)?.[0];

            if (attributeError) {
                const errorMessage =
                    attributeError.type === ErrorTypes.VALIDATION_ERROR
                        ? attributeError.message
                        : t(`errors.${attributeError.type}`);

                form.setFields([
                    {
                        name: attribute.id,
                        errors: [errorMessage]
                    }
                ]);
            }
        }
    };

    const handleExplorerCreateValue = ({
        recordIdCreated,
        saveValuesResultOnLink
    }: {
        recordIdCreated: string;
        saveValuesResultOnLink?: ISubmitMultipleResult;
    }) => {
        if (saveValuesResultOnLink) {
            handleExplorerLinkValue(saveValuesResultOnLink);
        }
    };

    return {
        handleDeleteAllValues,
        handleExplorerRemoveValue,
        handleExplorerMassDeactivateValues,
        handleExplorerLinkValue,
        handleExplorerCreateValue
    };
};
