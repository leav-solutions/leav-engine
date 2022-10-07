// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, CloseOutlined, FileTextOutlined} from '@ant-design/icons';
import {AnyPrimitive} from '@leav/utils';
import {Switch, Tooltip, Typography} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {stringifyDateRangeValue} from 'utils';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {IDateRangeValue, ITableCell} from '_types/types';

interface ISimpleCellProps {
    cellData: ITableCell;
    values: AnyPrimitive[];
}

const Wrapper = styled.div<{format: AttributeFormat}>`
    padding: 5px;
    width: 100%;
    text-align: ${props => (props.format === AttributeFormat.numeric ? 'right' : 'left')};
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
                    {cellData.format === AttributeFormat.boolean ? (
                        <Switch
                            disabled
                            checked={!!values[0]}
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                        />
                    ) : (
                        displayedValues
                    )}
                </Typography.Paragraph>
            )}
        </Wrapper>
    );
}

export default StandardCell;
