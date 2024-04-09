import {FunctionComponent, ReactNode, useEffect, useState} from 'react';
import {useQuery} from '@apollo/client';
import {
    getRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {AntForm, KitAvatar, KitSelect} from 'aristid-ds';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {APICallStatus, DeleteValueFunc, SubmitValueFunc} from '_ui/components/RecordEdition/EditRecordContent/_types';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {RecordFormAttributeLinkAttributeFragment, SortOrder} from '_ui/_gqlTypes';

interface IMonoValueSelectProps {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    attribute: RecordFormAttributeLinkAttributeFragment;
    label: string;
    onClearSelect: DeleteValueFunc;
    onSelectChange: SubmitValueFunc;
    required: boolean;
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
    label,
    onSelectChange,
    onClearSelect,
    required
}) => {
    const {t} = useSharedTranslation();
    const {errors} = AntForm.Item.useStatus();
    const form = AntForm.useFormInstance();

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

    const recordList = data?.records?.list ?? [];

    const [selectedValue, setSelectedValue] = useState<ISelectOption | undefined>(undefined);
    const [currentLinkValue, setCurrentLinkValue] = useState<RecordFormElementsValueLinkValue | undefined>({
        ...activeValue
    });

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
                    src={recordItem.whoAmI.preview?.small}
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

        setCurrentLinkValue((res?.values[0] as unknown) as RecordFormElementsValueLinkValue);
        setSelectedValue(selectOptions.find(option => option.value === optionValue));
        form.setFieldValue(attribute.id, optionValue);
        form.validateFields();
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

        setCurrentLinkValue(undefined);
        setSelectedValue(undefined);
    };

    useEffect(() => {
        if (activeValue) {
            setSelectedValue(selectOptions?.find(option => option.value === activeValue.linkValue.id));
        }
    }, [recordList]);

    return (
        <KitSelect
            loading={loading}
            defaultValue={selectedValue?.value}
            value={selectedValue}
            required={required}
            label={label}
            options={selectOptions}
            status={errors.length > 0 && 'error'}
            showSearch
            optionFilterProp="label"
            placeholder={t('record_edition.product_select')}
            onSelect={handleSelect}
            onClear={required ? undefined : handleClear}
            allowClear={!required}
        />
    );
};
