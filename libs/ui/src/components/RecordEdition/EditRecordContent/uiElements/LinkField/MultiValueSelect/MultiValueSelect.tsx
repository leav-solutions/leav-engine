// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
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
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';

interface IMultiValueSelectProps extends IProvidedByAntFormItem<SelectProps<string[]>, SelectProps> {
    activeValues: RecordFormElementsValueLinkValue[] | undefined;
    attribute: RecordFormAttributeLinkAttributeFragment;
    label: string;
    onValueDeselect: (value: IRecordPropertyLink) => void;
    onSelectChange: (values: Array<{value: IRecordIdentity; idValue: string}>) => void;
    required?: boolean;
    shouldShowValueDetailsButton?: boolean;
}

export const MultiValueSelect: FunctionComponent<IMultiValueSelectProps> = ({
    value,
    onChange,
    activeValues,
    attribute,
    label,
    onValueDeselect,
    onSelectChange,
    required = false,
    shouldShowValueDetailsButton = false
}) => {
    if (!onChange) {
        throw Error('MultiValueSelect should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();

    const [addedValues, setAddedValues] = useState<string[]>([]);
    const [clearedValues, setClearedValues] = useState<string[]>([]);

    const {loading, selectOptions, updateLeavField} = useGetOptionsQuery({
        attribute,
        onSelectChange
    });

    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: null,
        attribute
    });

    const _handleSelect = (optionValue: string, ...antOnChangeParams: DefaultOptionType[]) => {
        const newValues = Array.isArray(value) ? [...value, optionValue] : [optionValue];

        onChange(newValues, antOnChangeParams);

        if (antOnChangeParams.find(optionType => optionType.value === optionValue && !optionType.disabled)) {
            _addValue(optionValue);
        }
    };

    const _addValue = (valueToAdd: string) => {
        setAddedValues(values => Array.from(new Set([...values, valueToAdd])));
        setClearedValues(values => values.filter(v => v !== valueToAdd));
    };

    const _deleteValue = (valueToDelete: string, clear?: boolean) => {
        setAddedValues(values => values.filter(v => v !== valueToDelete));

        if (clear) {
            setClearedValues(values => Array.from(new Set([...values, valueToDelete])));
        }
    };

    const _clearValues = () => {
        value.forEach(v => _deleteValue(v, true));
        form.setFieldValue(attribute.id, undefined);
    };

    const _handleBlur = () => {
        const activeValuesId = activeValues.map(av => av.linkValue.id);
        const combinedValues = required && !addedValues.length ? clearedValues : addedValues;
        const valuesToAdd = combinedValues.filter(v => !activeValuesId.includes(v));
        const shouldRemoveNone =
            required &&
            !addedValues.length &&
            clearedValues.length === activeValues.length &&
            clearedValues.every(e => activeValuesId.includes(e));
        const valuesToRemove = shouldRemoveNone
            ? []
            : activeValues.filter(av => clearedValues.includes(av.linkValue.id));

        if (valuesToAdd.length || valuesToRemove.length) {
            updateLeavField(valuesToAdd, valuesToRemove);
        }
    };

    const _handleDeselect = (valueToDeselect: string) => {
        if (value.length === 1 && required) {
            return _deleteValue(valueToDeselect, true);
        }

        _deleteValue(valueToDeselect, false);

        const newValues = value.filter(val => val !== valueToDeselect);
        form.setFieldValue(attribute.id, newValues);

        const activeLinkValueToDeselect = activeValues.find(val => val.linkValue.id === valueToDeselect);
        if (activeLinkValueToDeselect) {
            onValueDeselect(activeLinkValueToDeselect);
        }
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
            onClear={_clearValues}
            onBlur={_handleBlur}
            // @ts-expect-error
            onDeselect={_handleDeselect}
            onChange={onChange}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
        />
    );
};
