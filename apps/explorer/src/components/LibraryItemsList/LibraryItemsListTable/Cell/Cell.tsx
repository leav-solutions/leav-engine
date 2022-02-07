// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileTextOutlined} from '@ant-design/icons';
import {Tooltip} from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import RecordCard from 'components/shared/RecordCard';
import {infosCol} from 'constants/constants';
import useSearchReducer from 'hooks/useSearchReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {displayTypeToPreviewSize, stringifyDateRangeValue} from '../../../../utils';
import {IDateRangeValue, ITableCell, PreviewSize} from '../../../../_types/types';
import CellInfos from './CellInfos';

const SimpleCell = styled.div`
    padding: 5px;
`;

const RecordCardCellWrapper = styled.div`
    display: flex;
    align-items: center;
`;

const MoreValuesCount = styled.span`
    padding: 0 0.75em;
    height: 1.75em;
    margin: 0 1em;
    border-radius: 2em;
    background: ${themingVar['@primary-color']};
    color: #fff;
    font-weight: bold;
`;

interface ICellProps {
    columnName: string;
    data: ITableCell;
}

const Cell = ({columnName, data}: ICellProps) => {
    const {value, type} = data;
    const [{lang}] = useLang();
    const {t} = useTranslation();

    const {state: searchState} = useSearchReducer();
    const previewSize: PreviewSize = displayTypeToPreviewSize(searchState.display.size);

    const _getValueByFormat = (cellValue: any): string => {
        switch (data.format) {
            case AttributeFormat.date_range:
                const rangeValue = cellValue as IDateRangeValue;
                return stringifyDateRangeValue(rangeValue, t);
            default:
                return cellValue;
        }
    };

    const valuesToDisplay = Array.isArray(value) ? value : [value];

    if (!value || !valuesToDisplay.length) {
        return <></>;
    }

    switch (type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            const displayedValues = valuesToDisplay.map(val => _getValueByFormat(val)).join(', ');

            return (
                <SimpleCell>
                    {data.format === AttributeFormat.extended ? (
                        <Tooltip overlay={displayedValues}>
                            <FileTextOutlined size={256} style={{fontSize: '2em'}} />
                        </Tooltip>
                    ) : (
                        <Paragraph
                            ellipsis={{
                                rows: 1,
                                tooltip: displayedValues
                            }}
                        >
                            {displayedValues}
                        </Paragraph>
                    )}
                </SimpleCell>
            );
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
        case AttributeType.tree:
            const [firstValue, ...otherValues] = valuesToDisplay;

            return (
                <RecordCardCellWrapper>
                    <RecordCard record={firstValue.whoAmI} size={previewSize} lang={lang} key={firstValue.whoAmI.id} />

                    {otherValues.length ? (
                        <Tooltip overlay={otherValues.map(val => val?.whoAmI?.label).join(', ')}>
                            <MoreValuesCount>+ {otherValues.length}</MoreValuesCount>
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                </RecordCardCellWrapper>
            );
        default:
            // selection and infos column has no type
            if (columnName === infosCol) {
                return <CellInfos record={value} previewSize={previewSize} lang={lang} />;
            }

            return <></>;
    }
};

export default Cell;
