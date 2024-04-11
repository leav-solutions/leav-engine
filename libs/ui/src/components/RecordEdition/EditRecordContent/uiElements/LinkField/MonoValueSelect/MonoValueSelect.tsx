import {FunctionComponent} from 'react';
import {AntForm, KitSelect} from 'aristid-ds';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {APICallStatus, DeleteValueFunc, SubmitValueFunc} from '_ui/components/RecordEdition/EditRecordContent/_types';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {RecordFormAttributeLinkAttributeFragment, SortOrder} from '_ui/_gqlTypes';
import {SelectProps} from 'antd';
import {DefaultOptionType} from 'antd/es/select';
import {useGetOptionsQuery} from './useGetOptionsQuery';

interface IMonoValueSelectProps {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    value?: SelectProps['value'];
    onChange?: SelectProps['onChange'];
    attribute: RecordFormAttributeLinkAttributeFragment;
    label: string;
    onSelectClear: DeleteValueFunc;
    onSelectChange: SubmitValueFunc;
    required: boolean;
}

export const MonoValueSelect: FunctionComponent<IMonoValueSelectProps> = ({
    activeValue,
    value,
    onChange,
    attribute,
    label,
    onSelectChange,
    onSelectClear,
    required
}) => {
    const {t} = useSharedTranslation();
    const {errors} = AntForm.Item.useStatus();
    const form = AntForm.useFormInstance();

    const {loading, selectOptions, updateLeavField} = useGetOptionsQuery({
        activeValue,
        linkedLibraryId: attribute.linked_library.id,
        onSelectChange
    });

    const handleSelect = (optionValue: string, ...antOnChangeParams: DefaultOptionType[]) => {
        onChange(optionValue, antOnChangeParams);

        updateLeavField({
            attribute,
            idValue: activeValue?.id_value ?? null,
            value: optionValue
        });
    };

    const handleClear = () => {
        form.setFieldValue(attribute.id, undefined);

        onSelectClear(
            {
                value: activeValue.linkValue.id,
                id_value: activeValue.id_value
            },
            activeValue.attribute.id
        );
    };

    return (
        <KitSelect
            loading={loading}
            value={value}
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
