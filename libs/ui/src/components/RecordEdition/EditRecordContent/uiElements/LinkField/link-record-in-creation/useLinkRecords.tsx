// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {DeleteValueFunc, ISubmittedValueLink, SubmitValueFunc} from '../../../_types';
import {useState} from 'react';
import {IExplorerFilterStandard} from '_ui/components/Explorer/_types';
import {FILTER_ON_ID_DEFAULT_FIELDS, NO_RECORD_FILTERS} from '../shared/utils';
import {AntForm} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IUseLinkRecordsProps {
    attribute: RecordFormAttributeFragment;
    libraryId: string;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
}

export const useLinkRecords = ({attribute, libraryId, onValueSubmit, onValueDelete}: IUseLinkRecordsProps) => {
    const {t} = useSharedTranslation();

    const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
    const [explorerFilters, setExplorerFilters] = useState<IExplorerFilterStandard[]>(NO_RECORD_FILTERS);
    const [explorerKey, setExplorerKey] = useState(0);

    const updateExplorerKey = () => setExplorerKey(explorerKey + 1);

    const form = AntForm.useFormInstance();

    const linkRecords = (recordIds: string[]) => {
        if (!attribute.multiple_values) {
            selectedRecordIds.forEach(id => {
                const originalIndex = selectedRecordIds.indexOf(id);

                // In Create mode, we don't really delete the value, we just remove them from the pending values
                onValueDelete(
                    {
                        id_value: `pending_${originalIndex + 1}`
                    },
                    attribute.id
                );
            });
        }

        const newSelectedRecordIds = attribute.multiple_values ? [...selectedRecordIds, ...recordIds] : [...recordIds];
        setSelectedRecordIds(newSelectedRecordIds);
        form.setFieldValue(attribute.id, newSelectedRecordIds);

        const newFilters = newSelectedRecordIds.map(id => ({
            ...FILTER_ON_ID_DEFAULT_FIELDS,
            value: id
        }));

        setExplorerFilters(newFilters.length > 0 ? newFilters : NO_RECORD_FILTERS);

        const valuesToAddInPending: ISubmittedValueLink[] = recordIds.map(id => ({
            attribute,
            idValue: null,
            value: {
                id,
                whoAmI: {
                    id,
                    library: {
                        id: libraryId
                    }
                }
            }
        }));

        form.setFields([
            {
                name: attribute.id,
                errors:
                    attribute.required && newSelectedRecordIds.length === 0 ? [t('errors.standard_field_required')] : []
            }
        ]);

        // In Create mode, we don't really submit the values, we just add them to the pending values
        onValueSubmit(valuesToAddInPending, null);
        updateExplorerKey();
    };

    const unlinkRecords = (recordIds?: string[]) => {
        selectedRecordIds
            .filter(id => (recordIds ? recordIds.includes(id) : true))
            .forEach(id => {
                const originalIndex = selectedRecordIds.indexOf(id);

                // In Create mode, we don't really delete the value, we just remove them from the pending values
                onValueDelete(
                    {
                        id_value: `pending_${originalIndex + 1}`
                    },
                    attribute.id
                );
            });

        if (!recordIds) {
            setSelectedRecordIds([]);
            setExplorerFilters(NO_RECORD_FILTERS);
            form.setFieldValue(attribute.id, []);
            updateExplorerKey();

            if (attribute.required) {
                form.setFields([
                    {
                        name: attribute.id,
                        errors: [t('errors.standard_field_required')]
                    }
                ]);
            }

            return;
        }

        const newSelectedRecordIds = selectedRecordIds.filter(id => !recordIds.includes(id));
        setSelectedRecordIds(newSelectedRecordIds);
        form.setFieldValue(attribute.id, newSelectedRecordIds);

        form.setFields([
            {
                name: attribute.id,
                errors:
                    attribute.required && newSelectedRecordIds.length === 0 ? [t('errors.standard_field_required')] : []
            }
        ]);

        const newExplorerFilters = explorerFilters.filter(filter => !recordIds.includes(filter.value));
        setExplorerFilters(newExplorerFilters.length > 0 ? newExplorerFilters : NO_RECORD_FILTERS);

        updateExplorerKey();
    };

    const hasNoSelectedRecord = selectedRecordIds.length === 0;

    const canDeleteAllValues = selectedRecordIds.length > 1 && attribute.multiple_values && !attribute.required;

    return {
        explorerFilters,
        explorerKey,
        selectedRecordIds,
        linkRecords,
        unlinkRecords,
        hasNoSelectedRecord,
        canDeleteAllValues
    };
};
