// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, ReactNode} from 'react';
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
    onSelectClear: () => void;
    onSelectChange: (values: IRecordIdentity[]) => void;
    infoButton?: ReactNode;
}

export const MultiValueSelect: FunctionComponent<IMultiValueSelectProps> = ({
    activeValues,
    value,
    onChange,
    attribute,
    label,
    onValueDeselect,
    onSelectChange,
    onSelectClear,
    infoButton
}) => {
    if (!onChange) {
        throw Error('MultiValueSelect should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();

    const {loading, selectOptions, updateLeavField} = useGetOptionsQuery({
        attribute,
        onSelectChange
    });

    const _handleSelect = (optionValue: string, ...antOnChangeParams: DefaultOptionType[]) => {
        const oldValues = Array.isArray(value) ? value : [];
        onChange([...oldValues, optionValue], antOnChangeParams);

        updateLeavField(optionValue);
    };

    const _handleClear = () => {
        form.setFieldValue(attribute.id, undefined);

        onSelectClear();
    };

    const _handleDeselect = (valueToDeselect: string) => {
        const newValues = value.filter(val => val !== valueToDeselect);
        form.setFieldValue(attribute.id, newValues);

        const linkValueToDeselect = activeValues.find(val => val.linkValue.id === valueToDeselect);
        onValueDeselect(linkValueToDeselect);
    };

    return (
        <KitSelect
            loading={loading}
            value={value}
            mode="multiple"
            label={label}
            options={selectOptions}
            showSearch
            optionFilterProp="label"
            placeholder={t('record_edition.record_select')}
            onSelect={_handleSelect}
            onClear={_handleClear}
            // @ts-expect-error
            onDeselect={_handleDeselect}
            onChange={onChange}
            infoIcon={infoButton}
            onInfoClick={Boolean(infoButton) ? () => void 0 : undefined}
        />
    );
};
