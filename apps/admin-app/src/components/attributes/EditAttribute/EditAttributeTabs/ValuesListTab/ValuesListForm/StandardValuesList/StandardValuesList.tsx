// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import dayjs from 'dayjs';
import React, {ChangeEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Input, List} from 'semantic-ui-react';
import {GET_ATTRIBUTES_VALUES_LIST_attributes_list} from '_gqlTypes/GET_ATTRIBUTES_VALUES_LIST';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {ValuesList} from '../../../../../../../_types/attributes';

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
    const [values, setValues] = useState<string[]>(initialValues as string[]);

    if (initialValues.length && typeof initialValues[0] === 'object') {
        return <div className="error">Invalid values</div>;
    }

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
        onValuesUpdate(newValuesList);
    };
    const _handleBlur = () => _submitValues(values);
    const _submitValues = (valuesToSubmit: string[]) => onValuesUpdate(valuesToSubmit);

    // Save values when pressing "enter"
    const _handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onValuesUpdate(values);
        }
    };

    return (
        <>
            <Button
                icon
                labelPosition="left"
                size="medium"
                data-test-id="values-list-add-btn"
                onClick={_addValue}
                type="button"
            >
                <Icon name="plus" />
                {t('attributes.add_value')}
            </Button>
            <List data-test-id="values-list-wrapper" style={{width: '100%'}}>
                {values.map((val, i) => {
                    let inputValue = val;

                    if (attribute.format === AttributeFormat.date) {
                        const dayVal = isNaN(Number(val)) ? dayjs() : dayjs(Number(val) * 1000);
                        inputValue = dayVal.format('YYYY-MM-DD');
                    }

                    return (
                        <List.Item data-test-id="values-list-value" key={`values_${i}`}>
                            <List.Content>
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
                                        'data-test-id': 'values-list-del-btn',
                                        type: 'button'
                                    }}
                                />
                            </List.Content>
                        </List.Item>
                    );
                })}
            </List>
        </>
    );
}

export default StandardValuesList;
