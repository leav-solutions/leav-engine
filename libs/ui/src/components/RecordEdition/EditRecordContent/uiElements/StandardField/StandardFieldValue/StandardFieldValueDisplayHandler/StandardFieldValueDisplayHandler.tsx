// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {ComponentProps, FunctionComponent, ReactNode} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue,
    StandardFieldReducerActionsTypes
} from '../../../../reducers/standardFieldReducer/standardFieldReducer';
import {DSBooleanWrapper} from '../DSBooleanWrapper';
import {DSDatePickerWrapper} from '../DSDatePickerWrapper';
import {DSInputNumberWrapper} from '../DSInputNumberWrapper';
import {DSInputEncryptedWrapper} from '../DSInputEncryptedWrapper';
import {DSInputWrapper} from '../DSInputWrapper';
import {DSRangePickerWrapper} from '../DSRangePickerWrapper';
import {StandardValueTypes} from '../../../../_types';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {StandardFieldValueRead} from './StandardFieldValueRead/StandardFieldValueRead';
import {useStandardFieldReducer} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/useStandardFieldReducer';
import {Form} from 'antd';
import {useTranslation} from 'react-i18next';
import {DSRichTextWrapper} from '../DSRichTextWrapper';
import {DSColorPickerWrapper} from '../DSColorPickerWrapper';
import {MonoValueSelect} from '../ValuesList/MonoValueSelect';

interface IStandardFieldValueDisplayHandlerProps {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeStandardAttributeFragment;
    fieldValue: IStandardFieldValue;
    shouldShowValueDetailsButton?: boolean;
    handleSubmit: (value: StandardValueTypes, id?: string) => void;
}

export const StandardFieldValueDisplayHandler: FunctionComponent<IStandardFieldValueDisplayHandlerProps> = ({
    attribute,
    fieldValue,
    handleSubmit
}) => {
    const {t} = useTranslation();
    const {state: editRecordState, dispatch: editRecordDispatch} = useEditRecordReducer();
    const {state, dispatch} = useStandardFieldReducer();
    const mustDisplayReadValue = !fieldValue.isEditing && attribute.format !== AttributeFormat.boolean;

    const _handleClickOnReadValue: ComponentProps<typeof StandardFieldValueRead>['onClick'] = e => {
        e.stopPropagation();

        if (state.isReadOnly) {
            return;
        }

        dispatch({
            type: StandardFieldReducerActionsTypes.FOCUS_FIELD,
            idValue: fieldValue.idValue
        });
    };

    const _handleBlur = () => {
        dispatch({
            type: StandardFieldReducerActionsTypes.CANCEL_EDITING,
            idValue: fieldValue.idValue
        });
    };

    const commonProps = {
        state,
        editRecordDispatch,
        handleSubmit,
        handleBlur: _handleBlur,
        attribute,
        fieldValue,
        shouldShowValueDetailsButton: editRecordState.withInfoButton
    };

    const isValuesListEnabled = Boolean(attribute.values_list?.enable);

    let valueContent: ReactNode;
    if (isValuesListEnabled) {
        valueContent = <MonoValueSelect {...commonProps} />;
    } else {
        switch (attribute.format) {
            case AttributeFormat.text:
                valueContent = <DSInputWrapper {...commonProps} />;
                break;
            case AttributeFormat.date:
                valueContent = <DSDatePickerWrapper {...commonProps} />;
                break;
            case AttributeFormat.date_range:
                valueContent = <DSRangePickerWrapper {...commonProps} />;
                break;
            case AttributeFormat.numeric:
                valueContent = <DSInputNumberWrapper {...commonProps} />;
                break;
            case AttributeFormat.encrypted:
                valueContent = <DSInputEncryptedWrapper {...commonProps} />;
                break;
            case AttributeFormat.boolean:
                valueContent = <DSBooleanWrapper {...commonProps} />;
                break;
            case AttributeFormat.rich_text:
                valueContent = <DSRichTextWrapper {...commonProps} />;
                break;
            case AttributeFormat.color:
                valueContent = <DSColorPickerWrapper {...commonProps} />;
        }
    }

    return (
        <>
            <div style={{display: mustDisplayReadValue ? 'block' : 'none'}}>
                <StandardFieldValueRead fieldValue={fieldValue} onClick={_handleClickOnReadValue} />
            </div>
            <Form.Item
                name={attribute.id}
                rules={[
                    {
                        required: state.formElement.settings.required,
                        message: t('errors.standard_field_required')
                    }
                ]}
                style={{display: mustDisplayReadValue ? 'none' : 'block'}}
            >
                {valueContent}
            </Form.Item>
        </>
    );
};
