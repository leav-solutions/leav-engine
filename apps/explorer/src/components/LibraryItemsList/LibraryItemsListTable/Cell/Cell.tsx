// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Paragraph from 'antd/lib/typography/Paragraph';
import RecordCard from 'components/shared/RecordCard';
import useSearchReducer from 'hooks/useSearchReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {infosCol} from '../../../../constants/constants';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {displayTypeToPreviewSize, stringifyDateRangeValue} from '../../../../utils';
import {IDateRangeValue, ITableCell, PreviewSize} from '../../../../_types/types';
import CellInfos from './CellInfos';

const SimpleCell = styled.div`
    padding: 5px;
`;

const RecordCardCellWrapper = styled.div`
    display: flex;
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

    if (!value || (Array.isArray(value) && !value.length)) {
        return <></>;
    }

    const displayedValue = _getValueByFormat(value);
    switch (type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            return (
                <SimpleCell>
                    <Paragraph
                        ellipsis={{
                            rows: 1,
                            tooltip: displayedValue
                        }}
                    >
                        {displayedValue}
                    </Paragraph>
                </SimpleCell>
            );
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
        case AttributeType.tree:
            const valuesToDisplay = Array.isArray(value) ? value : [value];

            return (
                <RecordCardCellWrapper>
                    {valuesToDisplay.map(val => (
                        <RecordCard record={{...val.whoAmI}} size={previewSize} lang={lang} key={val.whoAmI.id} />
                    ))}
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
