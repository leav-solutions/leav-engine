// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, CloseOutlined, FileTextOutlined} from '@ant-design/icons';
import {getInvertColor, IDateRangeValue} from '@leav/utils';
import {Switch, Tag, Tooltip, Typography} from 'antd';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AttributeFormat} from '_ui/_gqlTypes';
import {stringifyDateRangeValue} from '_ui/_utils';
import {ISimpleCellProps} from '../types';
import {getValuesToDisplayInCell} from '../utils';

const RichTextDisplay = React.lazy(() => import('./ElementsToDisplay/RichTextDisplay'));

const alignmentByFormat: Record<AttributeFormat, 'left' | 'right' | 'center'> = {
    [AttributeFormat.text]: 'left',
    [AttributeFormat.numeric]: 'right',
    [AttributeFormat.boolean]: 'center',
    [AttributeFormat.date]: 'left',
    [AttributeFormat.date_range]: 'left',
    [AttributeFormat.extended]: 'left',
    [AttributeFormat.encrypted]: 'left',
    [AttributeFormat.color]: 'left',
    [AttributeFormat.rich_text]: 'center'
};

const Wrapper = styled.div<{$format: AttributeFormat}>`
    padding: 5px;
    width: 100%;
    text-align: ${props => alignmentByFormat[props.$format]};
`;

function StandardCell({cellData, values}: ISimpleCellProps): JSX.Element {
    const {t} = useSharedTranslation();

    const _getValueByFormat = (cellValue: any): string => {
        switch (cellData.format) {
            case AttributeFormat.date_range:
                const rangeValue = cellValue as IDateRangeValue;
                return stringifyDateRangeValue(rangeValue, t);
            default:
                return cellValue;
        }
    };

    const formattedValuesToDisplay = getValuesToDisplayInCell(values)
        .map(valueData => _getValueByFormat(valueData?.value))
        .join(', ');

    const _getTagStyle = (value: string) => ({color: getInvertColor('#' + value)});

    const _getElementToDisplay = () => {
        switch (cellData.format) {
            case AttributeFormat.boolean:
                return (
                    <Switch
                        disabled
                        checked={!!values[0]}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                    />
                );
            case AttributeFormat.color:
                if (!isEmpty(values)) {
                    return (
                        <>
                            {values.map(valueHex => (
                                <Tag bordered={true} color={'#' + valueHex} style={_getTagStyle('#' + valueHex)}>
                                    {'#' + valueHex}
                                </Tag>
                            ))}
                        </>
                    );
                } else {
                    return formattedValuesToDisplay;
                }
            case AttributeFormat.rich_text:
                if (isEmpty(formattedValuesToDisplay)) {
                    return formattedValuesToDisplay;
                } else {
                    return <RichTextDisplay displayedValue={formattedValuesToDisplay} />;
                }

            default:
                return formattedValuesToDisplay;
        }
    };

    return (
        <Wrapper $format={cellData.format}>
            {cellData.format === AttributeFormat.extended ? (
                <Tooltip overlay={formattedValuesToDisplay}>
                    <FileTextOutlined size={256} style={{fontSize: '2em'}} />
                </Tooltip>
            ) : (
                <Typography.Paragraph
                    ellipsis={{
                        rows: 1,
                        tooltip: formattedValuesToDisplay
                    }}
                    style={{margin: 0}}
                >
                    {_getElementToDisplay()}
                </Typography.Paragraph>
            )}
        </Wrapper>
    );
}

export default StandardCell;
