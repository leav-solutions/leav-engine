// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CopyOutlined} from '@ant-design/icons';
import {IDateRangeValue} from '@leav/utils';
import {Button, Tooltip} from 'antd';
import {SyntheticEvent} from 'react';
import styled from 'styled-components';
import List from '_ui/components/List';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AttributeFormat, RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';

export interface IValueOfValuesList {
    value: string;
    rawValue: string | IDateRangeValue;
    isNewValue: boolean;
    canCopy: boolean;
}

interface IValuesListProps {
    attribute: RecordFormAttributeStandardAttributeFragment;
    valuesList: IValueOfValuesList[];
    onValueSelect: (value: string | IDateRangeValue) => void;
    onValueCopy: (value: string | IDateRangeValue) => void;
}
const ListItem = styled.div`
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

function ValuesList({attribute, valuesList: values, onValueCopy, onValueSelect}: IValuesListProps): JSX.Element {
    const {t, i18n} = useSharedTranslation();
    const _handleClick = (item: IValueOfValuesList) => {
        onValueSelect(item.rawValue);
    };

    const renderItem = (item: IValueOfValuesList) => {
        const _handleCopy = (e: SyntheticEvent) => {
            e.stopPropagation();

            onValueCopy(item.rawValue);
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
