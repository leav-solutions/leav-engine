// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, ReactNode} from 'react';
import {AntForm, KitSelect} from 'aristid-ds';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {RecordFormAttributeLinkAttributeFragment, SortOrder} from '_ui/_gqlTypes';
import {SelectProps} from 'antd';
import {DefaultOptionType} from 'antd/es/select';
import {useGetOptionsQuery} from './useGetOptionsQuery';
import {IRecordIdentity} from '_ui/types';
import {IRecordPropertyLink} from '_ui/_queries/records/getRecordPropertiesQuery';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';

interface IMonoValueSelectProps extends IProvidedByAntFormItem<SelectProps<string[]>, SelectProps<string>> {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    attribute: RecordFormAttributeLinkAttributeFragment;
    label: string;
    onSelectClear: (value: IRecordPropertyLink) => void;
    onSelectChange: (values: IRecordIdentity[]) => void;
    required: boolean;
    infoButton?: ReactNode;
}

export const MonoValueSelect: FunctionComponent<IMonoValueSelectProps> = ({
    activeValue,
    value,
    onChange,
    attribute,
    label,
    onSelectChange,
    onSelectClear,
    required,
    infoButton
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

    const handleSelect = async (optionValue: string, ...antOnChangeParams: DefaultOptionType[]) => {
        onChange(optionValue, antOnChangeParams);
        await form.validateFields([attribute.id]);

        updateLeavField(optionValue);
    };

    const handleClear = async () => {
        form.setFieldValue(attribute.id, undefined);
        await form.validateFields([attribute.id]);

        onSelectClear(activeValue);
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
            onChange={onChange}
            onClear={required ? undefined : handleClear}
            allowClear={!required}
            infoIcon={infoButton}
            onInfoClick={Boolean(infoButton) ? () => void 0 : undefined}
        />
    );
};
