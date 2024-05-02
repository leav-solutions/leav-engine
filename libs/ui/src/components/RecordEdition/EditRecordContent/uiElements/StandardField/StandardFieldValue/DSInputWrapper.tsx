// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput, KitInputWrapper} from 'aristid-ds';
import {FocusEvent, FunctionComponent, ReactNode} from 'react';
import {IStandardFieldReducerState} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form, InputProps} from 'antd';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';

interface IDSInputWrapperProps extends IProvidedByAntFormItem<InputProps> {
    state: IStandardFieldReducerState;
    infoButton: ReactNode;
    handleSubmit: (value: string, id?: string) => void;
}

export const DSInputWrapper: FunctionComponent<IDSInputWrapperProps> = ({
    state,
    value,
    infoButton,
    onChange,
    handleSubmit
}) => {
    const {errors} = Form.Item.useStatus();
    const form = Form.useFormInstance();

    const isRequired = state.formElement.settings.required;

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        let valuetoSubmit = e.target.value;
        if (isRequired && valuetoSubmit === '' && state.formElement.values[0]) {
            valuetoSubmit = (state.formElement.values[0] as RecordFormElementsValueStandardValue).raw_value;
            form.setFieldValue(state.attribute.id, valuetoSubmit);
            form.validateFields();
        }
        handleSubmit(valuetoSubmit, state.attribute.id);
    };

    return (
        <KitInputWrapper
            label={state.formElement.settings.label}
            required={isRequired}
            status={errors.length > 0 ? 'error' : undefined}
            infoIcon={infoButton}
            onInfoClick={Boolean(infoButton) ? () => void 0 : undefined}
        >
            <KitInput value={value} onChange={onChange} disabled={state.isReadOnly} onBlur={handleBlur} />
        </KitInputWrapper>
    );
};
