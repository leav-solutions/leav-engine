import React, {ChangeEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Input, List} from 'semantic-ui-react';
import {ValuesList} from '../../../../../../../_types/attributes';

interface IStandardValuesListProps {
    values: ValuesList;
    onValuesUpdate: (values: string[]) => void;
}

function StandardValuesList({values: initialValues, onValuesUpdate}: IStandardValuesListProps): JSX.Element {
    const {t} = useTranslation();
    const [values, setValues] = useState<string[]>(initialValues as string[]);

    if (initialValues.length && typeof initialValues[0] === 'object') {
        return <div className="error">Invalid values</div>;
    }

    const _editValue = (i: number) => (e: ChangeEvent<HTMLInputElement>) =>
        setValues([...values.slice(0, i), e.target.value, ...values.slice(i + 1)]);
    const _addValue = () => setValues([...values, '']);
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
                {values.map((val, i) => (
                    <List.Item data-test-id="values-list-value" key={`values_${i}`}>
                        <List.Content>
                            <Input
                                value={val}
                                size="small"
                                fluid
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
                ))}
            </List>
        </>
    );
}

export default StandardValuesList;
