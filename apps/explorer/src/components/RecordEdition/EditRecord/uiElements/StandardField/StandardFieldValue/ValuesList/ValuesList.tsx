// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CopyOutlined} from '@ant-design/icons';
import {Button, Tooltip} from 'antd';
import List from 'components/shared/List';
import React, {SyntheticEvent} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_FORM_forms_list_elements_elements_attribute_StandardAttribute} from '_gqlTypes/GET_FORM';
import {AttributeFormat} from '_gqlTypes/globalTypes';

export interface IValueOfValuesList {
    value: string;
    isNewValue: boolean;
    canCopy: boolean;
}

interface IValuesListProps {
    attribute: GET_FORM_forms_list_elements_elements_attribute_StandardAttribute;
    valuesList: IValueOfValuesList[];
    onValueSelect: (value: string) => void;
    onValueCopy: (value: string) => void;
}
const ListItem = styled.div`
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

function ValuesList({attribute, valuesList: values, onValueCopy, onValueSelect}: IValuesListProps): JSX.Element {
    const {t, i18n} = useTranslation();
    const _handleClick = item => onValueSelect(item.value);

    const renderItem = (item: IValueOfValuesList) => {
        const _handleCopy = (e: SyntheticEvent) => {
            e.stopPropagation();

            onValueCopy(item.value);
        };

        const valueToDisplay =
            attribute.format === AttributeFormat.date
                ? new Intl.DateTimeFormat(i18n.language).format(new Date(Number(item.value) * 1000))
                : item.value;

        return (
            <ListItem>
                <span>
                    {valueToDisplay}
                    {item.isNewValue && ` (${t('record_edition.new_value')})`}
                </span>
                {item.canCopy && (
                    <Tooltip title={t('record_edition.copy_value')}>
                        <Button icon={<CopyOutlined />} shape="circle" onClick={_handleCopy} />
                    </Tooltip>
                )}
            </ListItem>
        );
    };

    return (
        <List
            dataSource={values}
            bordered
            size="small"
            maxHeight={250}
            locale={{emptyText: t('record_edition.no_matching_value')}}
            renderItemContent={renderItem}
            onItemClick={_handleClick}
        />
    );
}

export default ValuesList;
