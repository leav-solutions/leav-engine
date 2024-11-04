// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import dayjs from 'dayjs';
import React, {ChangeEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Input, List} from 'semantic-ui-react';
import {GET_ATTRIBUTES_VALUES_LIST_attributes_list} from '_gqlTypes/GET_ATTRIBUTES_VALUES_LIST';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {IDateRangeValue, StandardValuesListType, ValuesList} from '../../../../../../../_types/attributes';
import DateRangeValue from './DateRangeValue';

interface IStandardValuesListProps {
    values: ValuesList;
    onValuesUpdate: (values: string[]) => void;
    attribute: GET_ATTRIBUTES_VALUES_LIST_attributes_list;
}

const inputTypeByFormat = {
    [AttributeFormat.text]: 'text',
    [AttributeFormat.date]: 'date',
    [AttributeFormat.numeric]: 'number',
    [AttributeFormat.boolean]: 'checkbox',
    [AttributeFormat.extended]: 'text',
    [AttributeFormat.encrypted]: 'text'
};

function StandardValuesList({values: initialValues, onValuesUpdate, attribute}: IStandardValuesListProps): JSX.Element {
    const {t} = useTranslation();
    const [values, setValues] = useState<StandardValuesListType>(initialValues as string[]);

    const _handleDateRangeValueChange = (i: number) => (value: IDateRangeValue) => {
        const newValues = [...values.slice(0, i), value, ...values.slice(i + 1)];
        setValues(newValues);
        _submitValues(newValues);
    };

    const _editValue = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        const newValue = String(attribute.format === AttributeFormat.date ? dayjs(inputValue).unix() : inputValue);

        setValues([...values.slice(0, i), newValue, ...values.slice(i + 1)]);
    };

    const _addValue = () => {
        const newValue = attribute.format === AttributeFormat.date ? dayjs().unix() : '';
        setValues([...values, String(newValue)]);
    };

    const _deleteValue = (i: number) => () => {
        const newValuesList = [...values.slice(0, i), ...values.slice(i + 1)];
        setValues(newValuesList);

        _submitValues(newValuesList);
    };

    const _handleBlur = () => _submitValues(values);

    const _submitValues = (valuesToSubmit: StandardValuesListType) =>
        onValuesUpdate(valuesToSubmit.map(v => (typeof v === 'object' ? JSON.stringify(v) : v)));

    // Save values when pressing "enter"
    const _handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            _submitValues(values);
        }
    };

    return (
        <>
            <Button icon labelPosition="left" size="medium" aria-label="add-value" onClick={_addValue} type="button">
                <Icon name="plus" />
                {t('attributes.add_value')}
            </Button>
            <List style={{width: '100%'}}>
                {values.map((val, i) => {
                    let inputValue = val;

                    if (attribute.format === AttributeFormat.date) {
                        const dayVal = isNaN(Number(val)) ? dayjs() : dayjs(Number(val) * 1000);
                        inputValue = dayVal.format('YYYY-MM-DD');
                    }

                    // We add values.length to element key to avoid some issues when deleting first value
                    return (
                        <List.Item aria-label="values-list-value" key={`values_${i}_${values.length}`}>
                            <List.Content>
                                {attribute.format === AttributeFormat.date_range ? (
                                    <DateRangeValue
                                        onChange={_handleDateRangeValueChange(i)}
                                        onDelete={_deleteValue(i)}
                                        value={inputValue as IDateRangeValue}
                                    />
                                ) : (
                                    <Input
                                        value={inputValue}
                                        size="small"
                                        fluid
                                        type={inputTypeByFormat[attribute.format]}
                                        onChange={_editValue(i)}
                                        onBlur={_handleBlur}
                                        onKeyPress={_handleKeyPress}
                                        action={{
                                            icon: 'trash',
                                            onClick: _deleteValue(i),
                                            type: 'button',
                                            'aria-label': 'delete-value'
                                        }}
                                    />
                                )}
                            </List.Content>
                        </List.Item>
                    );
                })}
            </List>
        </>
    );
}

export default StandardValuesList;
