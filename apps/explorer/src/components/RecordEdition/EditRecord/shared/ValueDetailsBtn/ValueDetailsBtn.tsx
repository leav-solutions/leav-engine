// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InfoOutlined} from '@ant-design/icons';
import {Button, ButtonProps} from 'antd';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from 'components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {GET_FORM_forms_list_elements_elements_attribute} from '_gqlTypes/GET_FORM';

interface IValueDetailsBtnProps extends Omit<ButtonProps, 'value'> {
    attribute: GET_FORM_forms_list_elements_elements_attribute;
    value: RecordProperty;
}

function ValueDetailsBtn({value, attribute, ...buttonProps}: IValueDetailsBtnProps): JSX.Element {
    const {dispatch} = useEditRecordReducer();

    const _handleClick = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: {
                value,
                attribute
            }
        });
    };

    return (
        <Button
            className="value-details-btn"
            shape="circle"
            {...buttonProps}
            icon={<InfoOutlined />}
            onClick={_handleClick}
        />
    );
}

export default ValueDetailsBtn;
