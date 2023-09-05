// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, CloseOutlined, FileTextOutlined, EllipsisOutlined} from '@ant-design/icons';
import {AnyPrimitive} from '@leav/utils';
import {Switch, Tag, Tooltip, Typography} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getInvertColor, stringifyDateRangeValue} from 'utils';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {IDateRangeValue, ITableCell} from '_types/types';
import {isEmpty} from 'lodash';
import parse from 'html-react-parser';

interface ISimpleCellProps {
    cellData: ITableCell;
    values: AnyPrimitive[];
}

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

const Wrapper = styled.div<{format: AttributeFormat}>`
    padding: 5px;
    width: 100%;
    text-align: ${props => alignmentByFormat[props.format]};
`;

function StandardCell({cellData, values}: ISimpleCellProps): JSX.Element {
    const {t} = useTranslation();

    const _getValueByFormat = (cellValue: any): string => {
        switch (cellData.format) {
            case AttributeFormat.date_range:
                const rangeValue = cellValue as IDateRangeValue;
                return stringifyDateRangeValue(rangeValue, t);
            default:
                return cellValue;
        }
    };

    const displayedValues = values.map(val => _getValueByFormat(val)).join(', ');

    const _getTagStyle = (value: string) => {
        return {color: getInvertColor('#' + value)};
    };

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
                    return displayedValues;
                }
            case AttributeFormat.rich_text:
                if (!isEmpty(displayedValues)) {
                    const ellipsisOutlinedStyle: React.CSSProperties = {
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#d9d9d9',
                        background: 'white',
                        borderRadius: '10px'
                    };
                    const parseValue = parse(displayedValues);
                    return (
                        <Tooltip overlay={parseValue}>
                            <EllipsisOutlined style={ellipsisOutlinedStyle} />
                        </Tooltip>
                    );
                } else {
                    return displayedValues;
                }

            default:
                return displayedValues;
        }
    };

    return (
        <Wrapper format={cellData.format}>
            {cellData.format === AttributeFormat.extended ? (
                <Tooltip overlay={displayedValues}>
                    <FileTextOutlined size={256} style={{fontSize: '2em'}} />
                </Tooltip>
            ) : (
                <Typography.Paragraph
                    ellipsis={{
                        rows: 1,
                        tooltip: displayedValues
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
