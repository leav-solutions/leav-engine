// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CopyOutlined} from '@ant-design/icons';
import {Button, Tooltip} from 'antd';
import List from 'components/shared/List';
import React, {SyntheticEvent} from 'react';
import {useTranslation} from 'react-i18next';

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

function ValuesList({valuesList: values, onValueCopy, onValueSelect}: IValuesListProps): JSX.Element {
    const {t} = useTranslation();
    const _handleClick = item => onValueSelect(item.value);

    const renderItem = (item: IValueOfValuesList) => {
        const _handleCopy = (e: SyntheticEvent) => {
            e.stopPropagation();

            onValueCopy(item.value);
        };

        return (
            <>
                <span>
                    {item.value}
                    {item.isNewValue && ` (${t('record_edition.new_value')})`}
                </span>
                {item.canCopy && (
                    <Tooltip title={t('record_edition.copy_value')}>
                        <Button icon={<CopyOutlined />} shape="circle" onClick={_handleCopy} />
                    </Tooltip>
                )}
            </>
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
