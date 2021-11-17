// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InfoCircleOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from 'components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {GET_FORM_forms_list_elements_elements_attribute} from '_gqlTypes/GET_FORM';

interface IValueDetailsBtnProps {
    attribute: GET_FORM_forms_list_elements_elements_attribute;
    value: RecordProperty;
}

function ValueDetailsBtn({value, attribute}: IValueDetailsBtnProps): JSX.Element {
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

    return <Button className="value-details-btn" icon={<InfoCircleOutlined />} size="small" onClick={_handleClick} />;
}

export default ValueDetailsBtn;
