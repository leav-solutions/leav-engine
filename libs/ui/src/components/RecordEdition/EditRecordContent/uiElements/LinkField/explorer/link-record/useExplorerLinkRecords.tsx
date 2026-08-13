import {type RecordFilterInput, type RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {APICallStatus, type ISubmitMultipleResult} from '../../../../_types';
import {type Dispatch, type SetStateAction} from 'react';
import {type IItemData, type MassSelection} from '_ui/components/Explorer/_types';
import {AntForm} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {ErrorTypes} from '@leav/utils';

interface IUseExplorerLinkRecordsProps {
    attribute: RecordFormAttributeLinkAttributeFragment;
    backendValues: RecordFormElementsValueLinkValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
}

export const useExplorerLinkRecords = ({attribute, backendValues, setBackendValues}: IUseExplorerLinkRecordsProps) => {
    const {t} = useSharedTranslation();

    const form = AntForm.useFormInstance();

    const removeValues = (filterFn?: (id: string) => boolean, useIdValue: boolean = false) => {
        if (!filterFn) {
            form.setFieldValue(attribute.id, []);
            form.setFields([
                {
                    name: attribute.id,
                    errors: attribute.required ? [t('errors.standard_field_required')] : [],
                },
            ]);
            setBackendValues([]);
            return;
        }

        const newBackendValues = backendValues.filter(backendValue =>
            filterFn(useIdValue ? backendValue.id_value : backendValue.linkValue.id),
        );

        form.setFieldValue(
            attribute.id,
            newBackendValues.map(({linkValue}) => linkValue.id),
        );

        form.setFields([
            {
                name: attribute.id,
                errors:
                    attribute.required && newBackendValues.length === 0 ? [t('errors.standard_field_required')] : [],
            },
        ]);

        setBackendValues(previousBackendValues =>
            previousBackendValues.filter(backendValue =>
                filterFn(useIdValue ? backendValue.id_value : backendValue.linkValue.id),
            ),
        );
    };

    const handleExplorerRemoveValue = (item: IItemData) => {
        removeValues(id => id !== item.itemId);
    };

    const handleExplorerMassDeactivateValues = (
        _massSelectedFilter: RecordFilterInput[],
        massSelection: MassSelection,
    ) => {
        removeValues(idValue => !massSelection.includes(idValue), true);
    };

    const handleExplorerLinkValue = (saveValuesResult: ISubmitMultipleResult) => {
        if (saveValuesResult.status === APICallStatus.SUCCESS) {
            const saveLinkValues = saveValuesResult.values as unknown as RecordFormElementsValueLinkValue[];

            form.setFieldValue(attribute.id, [
                ...backendValues.map(({linkValue}) => linkValue.id),
                ...saveLinkValues.map(({linkValue}) => linkValue.id),
            ]);

            form.setFields([
                {
                    name: attribute.id,
                    errors: [],
                },
            ]);

            setBackendValues(previousBackendValues => [...previousBackendValues, ...saveLinkValues]);
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
                        errors: [errorMessage],
                    },
                ]);
            }
        }
    };

    const handleExplorerCreateValue = ({saveValuesResultOnLink}: {saveValuesResultOnLink?: ISubmitMultipleResult}) => {
        if (saveValuesResultOnLink) {
            handleExplorerLinkValue(saveValuesResultOnLink);
        }
    };

    return {
        handleExplorerRemoveValue,
        handleExplorerMassDeactivateValues,
        handleExplorerLinkValue,
        handleExplorerCreateValue,
    };
};
