// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, CloseOutlined, FileTextOutlined} from '@ant-design/icons';
import {AnyPrimitive} from '@leav/utils';
import {Switch, Tag, Tooltip, Typography} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {stringifyDateRangeValue} from 'utils';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {IDateRangeValue, ITableCell} from '_types/types';
import { cp } from 'fs';
import { isEmpty } from 'lodash';

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
    [AttributeFormat.color]: 'left'
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

    const _getElementToDisplay = () => {
        switch (cellData.format){
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
                if(!isEmpty(displayedValues)){
                    const colorHexValue = "#" + displayedValues;          

                    const hexToRGB = (values : string) => {
                        const red = parseInt(values.slice(1, 3), 16);
                        const green = parseInt(values.slice(3, 5), 16);
                        const blue = parseInt(values.slice(5, 7), 16);
                        return (red*0.299 + green*0.587 + blue*0.114) > 186 ? { color:"black"} : { color:"white" };
                    }

                    return (
                        <Tag bordered={true} color={colorHexValue} style={hexToRGB(colorHexValue)}>{colorHexValue}</Tag>
                    );
                }
                else{
                    return displayedValues
                }
            default:
                return displayedValues;
        }
    }


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
