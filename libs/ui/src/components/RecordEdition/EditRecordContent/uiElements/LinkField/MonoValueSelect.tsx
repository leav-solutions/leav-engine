import {FunctionComponent, ReactNode, useEffect, useState} from 'react';
import {useQuery} from '@apollo/client';
import {
    getRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {KitAvatar, KitSelect} from 'aristid-ds';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {LinkFieldReducerState} from '_ui/components/RecordEdition/EditRecordContent/uiElements/LinkField/LinkField';
import {APICallStatus, DeleteValueFunc, SubmitValueFunc} from '_ui/components/RecordEdition/EditRecordContent/_types';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {RecordFormAttributeLinkAttributeFragment, SortOrder} from '_ui/_gqlTypes';

interface IMonoValueSelectProps {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    attribute: RecordFormAttributeLinkAttributeFragment;
    onClearSelect: DeleteValueFunc;
    onSelectChange: SubmitValueFunc;
    state: LinkFieldReducerState;
}

interface ISelectOption {
    value: string;
    label: string;
    idCard: {
        title: string;
        avatar: ReactNode;
    };
}

export const MonoValueSelect: FunctionComponent<IMonoValueSelectProps> = ({
    attribute,
    activeValue,
    onSelectChange,
    onClearSelect,
    state
}) => {
    const {t} = useSharedTranslation();

    const {loading, data} = useQuery<IGetRecordsFromLibraryQuery, IGetRecordsFromLibraryQueryVariables>(
        getRecordsFromLibraryQuery(),
        {
            fetchPolicy: 'network-only',
            variables: {
                library: attribute.linked_library.id,
                limit: 20,
                sort: {
                    field: 'label',
                    order: SortOrder.asc
                }
            }
        }
    );
    const recordList = data?.records.list ?? [];

    const [selectedValue, setSelectedValue] = useState<ISelectOption | null>(null);
    const [currentLinkValue, setCurrentLinkValue] = useState<RecordFormElementsValueLinkValue>({...activeValue});

    const isRequired = state.formElement.settings.required;
    const selectOptions: ISelectOption[] = recordList.map(recordItem => ({
        value: recordItem.whoAmI.id,
        label: recordItem.whoAmI.label,
        idCard: {
            title: recordItem.whoAmI.label,
            avatar: (
                <KitAvatar
                    size={'small'}
                    shape={'square'}
                    imageFit={'contain'}
                    src={recordItem.whoAmI.preview.small}
                    label={recordItem.whoAmI.label}
                />
            )
        }
    }));

    const handleSelect = async (optionValue: string) => {
        const selectedLinkValue = recordList.find(record => record.id === optionValue);

        const res = await onSelectChange(
            [
                {
                    attribute,
                    idValue: currentLinkValue?.id_value ?? null,
                    value: selectedLinkValue
                }
            ],
            null
        );

        setCurrentLinkValue((res.values[0] as unknown) as RecordFormElementsValueLinkValue);
        setSelectedValue(selectOptions.find(option => option.value === optionValue));
    };

    const handleClear = async () => {
        const res = await onClearSelect(
            {
                value: currentLinkValue.linkValue.id,
                id_value: currentLinkValue.id_value
            },
            currentLinkValue.attribute.id
        );

        if (res.status === APICallStatus.ERROR) {
            throw new Error("Can't delete the value");
        }

        setCurrentLinkValue(null);
        setSelectedValue(null);
    };

    useEffect(() => {
        if (activeValue) {
            setSelectedValue(
                selectOptions ? selectOptions.find(option => option.value === activeValue.linkValue.id) : null
            );
        }
    }, [recordList]);

    return (
        <KitSelect
            loading={loading}
            defaultValue={selectedValue?.value}
            value={selectedValue}
            required={isRequired}
            label={state.formElement.settings.label}
            options={selectOptions}
            showSearch
            optionFilterProp="label"
            placeholder={t('record_edition.product_select')}
            onSelect={handleSelect}
            onClear={!isRequired ? handleClear : undefined}
            allowClear={!isRequired}
        />
    );
};
