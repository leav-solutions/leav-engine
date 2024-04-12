import {FunctionComponent} from 'react';
import {AntForm, KitSelect} from 'aristid-ds';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {RecordFormAttributeLinkAttributeFragment, SortOrder} from '_ui/_gqlTypes';
import {SelectProps} from 'antd';
import {DefaultOptionType} from 'antd/es/select';
import {useGetOptionsQuery} from './useGetOptionsQuery';
import {IRecordIdentity} from '_ui/types';
import {IRecordPropertyLink} from '_ui/_queries/records/getRecordPropertiesQuery';

interface IMonoValueSelectProps {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    value?: SelectProps['value'];
    onChange?: SelectProps['onChange'];
    attribute: RecordFormAttributeLinkAttributeFragment;
    label: string;
    onSelectClear: (value: IRecordPropertyLink, fetchFreshValues: boolean) => void;
    onSelectChange: (values: IRecordIdentity[]) => void;
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
    if (!onChange) {
        throw Error('MonoValueSelect should be used inside a antd Form.Item');
    }

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

        updateLeavField(optionValue);
    };

    const handleClear = () => {
        form.setFieldValue(attribute.id, undefined);

        onSelectClear(activeValue, false);
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
            placeholder={t('record_edition.record_select')}
            onSelect={handleSelect}
            onClear={required ? undefined : handleClear}
            allowClear={!required}
        />
    );
};
