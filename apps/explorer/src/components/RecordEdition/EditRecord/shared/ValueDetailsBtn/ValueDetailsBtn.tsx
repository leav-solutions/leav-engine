// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InfoCircleOutlined} from '@ant-design/icons';
import {Button, Popover} from 'antd';
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {GET_FORM_forms_list_elements_elements_attribute} from '_gqlTypes/GET_FORM';
import ValueDetails from '../../shared/ValueDetails';

interface IValueDetailsBtnProps {
    attribute: GET_FORM_forms_list_elements_elements_attribute;
    value: RecordProperty;
}

function ValueDetailsBtn({value, attribute}: IValueDetailsBtnProps): JSX.Element {
    return (
        <Popover
            overlayStyle={{maxWidth: '50vw'}}
            placement="topLeft"
            content={<ValueDetails value={value} attribute={attribute} />}
            trigger="click"
        >
            <Button icon={<InfoCircleOutlined />} size="small" />
        </Popover>
    );
}

export default ValueDetailsBtn;
