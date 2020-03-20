import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Form, Input} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_LIBRARIES_libraries_list_attributes} from '../../../../../../../_gqlTypes/GET_LIBRARIES';
import {IGenericValue, IValue} from '../../../../../../../_types/records';

interface IEditRecordInputProps {
    attribute: GET_LIBRARIES_libraries_list_attributes;
    value: IGenericValue;
    onSubmit: () => void;
    onDelete: () => void;
    onCancel: () => void;
    onChange: (newValue: string) => void;
}

// tslint:disable-next-line:variable-name
const ButtonsWrapper = styled(Button.Group)`
    &&& {
        position: absolute;
        top: 0;
        right: 0;
        float: right;
        border-radius: 0;
        bottom: 0;
        border-right: none;
        border-top: none;
        border-bottom: none;
    }
`;

// tslint:disable-next-line:variable-name
const InputWrapper = styled(Form.Field)`
    position: relative;
`;

// tslint:disable-next-line:variable-name
const StyledInput = styled(Input)`
    & input:focus {
        padding-right: 120px;
    }
`;
StyledInput.displayName = 'Input';

// tslint:disable-next-line:variable-name
function EditRecordInput({
    value,
    attribute,
    onChange,
    onSubmit,
    onDelete,
    onCancel
}: IEditRecordInputProps): JSX.Element {
    const {t} = useTranslation();
    const [editing, setEditing] = useState(false);
    let blurTimeoutRef;

    useEffect(() => {
        return () => {
            // Clear timeout created on blur to avoid warnings about updating state on unmounted components
            if (blurTimeoutRef) {
                setEditing(false); // Force editing to false in case to make sure we don't stay with editing = true
                clearTimeout(blurTimeoutRef);
            }
        };
    });

    const _handleFocus = () => setEditing(true);

    const _handleValidate = () => {
        onSubmit();
        setEditing(false);
    };

    const _handleChange = e => {
        onChange(e.target.value);
        setEditing(true);
    };

    const _handleCancel = () => {
        onCancel();
        setEditing(false);
    };

    const _handleDelete = () => {
        onDelete();

        setEditing(false);
    };

    const _handleKeyPress = e => {
        if (e.key === 'Enter') {
            _handleValidate();
            e.target.blur();
        }
        setEditing(false);
    };

    const _handleBlur = e => {
        // This is a ugly hack to make sure we hide buttons when user clicks on another field.
        // The best behavior would be to save value on blur, but it's really hard to implement because
        // the blur event messes around with the buttons and it's hard to know if we clicked on a button.
        // Things would be easier if Firefox filled relatedTarget on the event as expected, but it's not
        // TODO: find a better solution!
        blurTimeoutRef = setTimeout(() => setEditing(false), 150);
    };

    return (
        <InputWrapper data-test-id="input-wrapper" style={{marginBottom: '15px'}} id={attribute.id}>
            <StyledInput
                fluid
                type="text"
                name={`${attribute.id}_${value?.id_value || 'newVal'}`}
                value={(value as IValue)?.value || ''}
                disabled={attribute.system}
                onFocus={_handleFocus}
                onChange={_handleChange}
                onKeyPress={_handleKeyPress}
                onBlur={_handleBlur}
                key={`${attribute.id}_${value?.id_value || 'newVal'}`}
            />
            {editing && (
                <ButtonsWrapper basic size="small">
                    <Button
                        onClick={_handleCancel}
                        className="record-input-btn"
                        data-test-id="cancel-btn"
                        title={t('admin.cancel')}
                        icon="undo"
                    />
                    <Button
                        onClick={_handleDelete}
                        className="record-input-btn"
                        data-test-id="delete-btn"
                        title={t('attributes.remove_value')}
                        icon="trash"
                    />
                    <Button
                        onClick={_handleValidate}
                        className="record-input-btn"
                        data-test-id="submit-btn"
                        title={t('admin.submit')}
                        icon="check"
                    />
                </ButtonsWrapper>
            )}
        </InputWrapper>
    );
}

export default EditRecordInput;
