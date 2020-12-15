// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../utils';
import {GET_LIB_BY_ID_libraries_list_attributes} from '../../../../../../_gqlTypes/GET_LIB_BY_ID';
import {AttributeType, ValueInput} from '../../../../../../_gqlTypes/globalTypes';
import {IValue} from '../../../../../../_types/records';
import EditRecordInput from './EditRecordInput';
import reducer, {StandardValuesActionTypes} from './StandardValuesReducer';

interface IStandardValuesWrapperProps {
    attribute: GET_LIB_BY_ID_libraries_list_attributes;
    values: IValue | IValue[];
    readonly: boolean;
    onSubmit: (value: ValueInput) => void;
    onDelete: (value: ValueInput) => void;
}

const _prepareValues = (vals: IValue | IValue[]): IValue[] => {
    const values = (Array.isArray(vals) ? vals : [vals]).filter(v => v !== null);

    if (!values.length) {
        values.push({id_value: null, value: '', raw_value: '', modified_at: null, created_at: null, version: null});
    }

    return values;
};

const FieldLabel = styled.label`
    font-weight: bold;
    margin-bottom: 0.5em;
`;

const InputWrapper = styled.div`
    position: relative;
`;

function StandardValuesWrapper({
    attribute,
    values,
    readonly,
    onSubmit,
    onDelete
}: IStandardValuesWrapperProps): JSX.Element {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const attributeLabel = localizedLabel(attribute.label, availableLanguages);

    const initialValues = _prepareValues(values);
    const [state, dispatch] = useReducer(reducer, {
        values: initialValues,
        initialValues
    });
    const {values: valuesToDisplay} = state;

    useEffect(() => {
        dispatch({type: StandardValuesActionTypes.REINIT, data: {values: _prepareValues(values)}});
    }, [values]);

    const _addValue = () => {
        dispatch({type: StandardValuesActionTypes.ADD});
    };

    const _getValueInputByIndex = (index): ValueInput => {
        const val: IValue = state.values[index];
        return {
            id_value: val.id_value,
            value: String(val.value)
        };
    };

    const _handleChange = index => (newValue: string) => {
        dispatch({type: StandardValuesActionTypes.CHANGE, data: {valueIndex: index, newValue}});
    };

    const _handleSubmit = (index: number) => () => {
        dispatch({type: StandardValuesActionTypes.SUBMIT, data: {valueIndex: index}});
        onSubmit(_getValueInputByIndex(index));
    };

    const _handleDelete = index => () => {
        dispatch({type: StandardValuesActionTypes.DELETE, data: {valueIndex: index}});

        if (valuesToDisplay[index].id_value || attribute.type === AttributeType.simple) {
            onDelete(_getValueInputByIndex(index));
        }
    };

    const _handleCancel = index => () => {
        dispatch({type: StandardValuesActionTypes.CANCEL, data: {valueIndex: index}});
    };

    const canAddValue = !readonly && (attribute.multiple_values || !valuesToDisplay.length);

    return (
        <InputWrapper data-test-id="input-wrapper" key={attribute.id} style={{marginBottom: '15px'}} id={attribute.id}>
            <FieldLabel>{attributeLabel}</FieldLabel>
            {canAddValue && (
                <Button
                    type="button"
                    size="mini"
                    compact
                    basic
                    icon
                    labelPosition="right"
                    style={{margin: '5px'}}
                    onClick={_addValue}
                    data-test-id="add_value_btn"
                    id={attribute.id}
                >
                    <Icon name="plus" id={attribute.id} />
                    {t('records.add_value')}
                </Button>
            )}
            {valuesToDisplay.map((v, i) => (
                <EditRecordInput
                    key={attribute.id + '_' + i}
                    attribute={attribute}
                    value={v}
                    onChange={_handleChange(i)}
                    onSubmit={_handleSubmit(i)}
                    onDelete={_handleDelete(i)}
                    onCancel={_handleCancel(i)}
                />
            ))}
        </InputWrapper>
    );
}

export default StandardValuesWrapper;
