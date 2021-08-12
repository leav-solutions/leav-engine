// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CopyOutlined} from '@ant-design/icons';
import {Button, List as AntdList, Tooltip} from 'antd';
import List from 'components/shared/List';
import React, {SyntheticEvent} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

export interface IValueOfValuesList {
    value: string;
    isNewValue: boolean;
    canCopy: boolean;
}

interface IValuesListProps {
    valuesList: IValueOfValuesList[];
    onValueSelect: (value: string) => void;
    onValueCopy: (value: string) => void;
}

const ListItem = styled(AntdList.Item)`
    cursor: pointer;
    display: flex;
    justify-content: space-between;
`;

function ValuesList({valuesList: values, onValueCopy, onValueSelect}: IValuesListProps): JSX.Element {
    const {t} = useTranslation();

    const renderItem = (item: IValueOfValuesList) => {
        const _handleClick = () => onValueSelect(item.value);
        const _handleCopy = (e: SyntheticEvent) => {
            e.stopPropagation();

            onValueCopy(item.value);
        };

        return (
            <ListItem onClick={_handleClick}>
                <span>
                    {item.value}
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
            renderItem={renderItem}
        />
    );
}

export default ValuesList;
