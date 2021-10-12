// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Paragraph from 'antd/lib/typography/Paragraph';
import RecordCard from 'components/shared/RecordCard';
import React from 'react';
import useSearchReducer from 'hooks/useSearchReducer';
import styled from 'styled-components';
import {infosCol} from '../../../../constants/constants';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {displayTypeToPreviewSize} from '../../../../utils';
import {AttributeType, IRecordIdentityWhoAmI, ITableCell, PreviewSize} from '../../../../_types/types';
import CellInfos from './CellInfos';

const SimpleCell = styled.div`
    padding: 5px;
`;

const RecordCardCellWrapper = styled.div`
    display: flex;
`;

interface ICellProps {
    record: IRecordIdentityWhoAmI;
    columnName: string;
    data: ITableCell;
    index: string;
}

const Cell = ({columnName, data, index, record}: ICellProps) => {
    const {value, type} = data;
    const [{lang}] = useLang();

    const {state: searchState} = useSearchReducer();
    const previewSize: PreviewSize = displayTypeToPreviewSize(searchState.display.size);

    if (!value || (Array.isArray(value) && !value.length)) {
        return <></>;
    }

    switch (type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            return (
                <SimpleCell>
                    <Paragraph
                        ellipsis={{
                            rows: 1,
                            tooltip: value
                        }}
                    >
                        {value}
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
