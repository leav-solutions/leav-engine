// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, ReactNode, useState} from 'react';
import {AntForm, KitSelect} from 'aristid-ds';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {SelectProps} from 'antd';
import {DefaultOptionType} from 'antd/es/select';
import {useGetOptionsQuery} from './useGetOptionsQuery';
import {IRecordIdentity} from '_ui/types';
import {IRecordPropertyLink} from '_ui/_queries/records/getRecordPropertiesQuery';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';

interface IMultiValueSelectProps extends IProvidedByAntFormItem<SelectProps<string[]>, SelectProps> {
    activeValues: RecordFormElementsValueLinkValue[] | undefined;
    attribute: RecordFormAttributeLinkAttributeFragment;
    label: string;
    onValueDeselect: (value: IRecordPropertyLink) => void;
    onSelectChange: (values: Array<{value: IRecordIdentity; idValue: string}>) => void;
    infoButton?: ReactNode;
    required: boolean;
}

export const MultiValueSelect: FunctionComponent<IMultiValueSelectProps> = ({
    activeValues,
    value,
    onChange,
    attribute,
    label,
    onValueDeselect,
    onSelectChange,
    required,
    infoButton
}) => {
    if (!onChange) {
        throw Error('MultiValueSelect should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();

    const [initialValues] = useState<string[]>(value);
    const [clearedValues, setClearedValues] = useState<string[]>([]);

    const {loading, selectOptions, updateLeavField} = useGetOptionsQuery({
        attribute,
        onSelectChange
    });

    const _handleSelect = (optionValue: string, ...antOnChangeParams: DefaultOptionType[]) => {
        const newValues = Array.isArray(value) ? [...value, optionValue] : [optionValue];

        onChange(newValues, antOnChangeParams);

        if (antOnChangeParams.find(optionType => optionType.value === optionValue && !optionType.disabled)) {
            setClearedValues(values => values.filter(value => value !== optionValue));
        }
    };

    const _handleClear = () => {
        setClearedValues(values => [...new Set(values.concat(value))]);
        form.setFieldValue(attribute.id, undefined);
    };

    const _handleBlur = () => {
        if (!value.length) {
            return;
        }

        const valuesToAdd = value.filter(val => !initialValues.includes(val));
        const valuesToRemove = activeValues.filter(av => clearedValues.includes(av.linkValue.id));
        updateLeavField(valuesToAdd, valuesToRemove);
    };

    const _handleDeselect = (valueToDeselect: string) => {
        if (value.length === 1) {
            return _handleClear();
        }

        const newValues = value.filter(val => val !== valueToDeselect);
        form.setFieldValue(attribute.id, newValues);

        const linkValueToDeselect = activeValues.find(val => val.linkValue.id === valueToDeselect);
        onValueDeselect(linkValueToDeselect);
    };

    return (
        <KitSelect
            loading={loading}
            value={value}
            required={required}
            mode="multiple"
            label={label}
            options={selectOptions}
            showSearch
            optionFilterProp="label"
            placeholder={t('record_edition.record_select')}
            onSelect={_handleSelect}
            onClear={_handleClear}
            onBlur={_handleBlur}
            // @ts-expect-error
            onDeselect={_handleDeselect}
            onChange={onChange}
            infoIcon={infoButton}
            onInfoClick={Boolean(infoButton) ? () => void 0 : undefined}
        />
    );
};
