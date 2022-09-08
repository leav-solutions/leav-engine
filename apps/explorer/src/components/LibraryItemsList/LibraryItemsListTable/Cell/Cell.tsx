// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import RecordCard from 'components/shared/RecordCard';
import {infosCol} from 'constants/constants';
import useSearchReducer from 'hooks/useSearchReducer';
import React from 'react';
import styled from 'styled-components';
import {AttributeType} from '_gqlTypes/globalTypes';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {displayTypeToPreviewSize} from '../../../../utils';
import {ITableCell, PreviewSize} from '../../../../_types/types';
import AllValuesCount from './AllValuesCount';
import CellInfos from './CellInfos';
import StandardCell from './StandardCell';

const RecordCardCellWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

interface ICellProps {
    columnName: string;
    data: ITableCell;
}

const Cell = ({columnName, data}: ICellProps) => {
    const {value, type} = data;
    const [{lang}] = useLang();

    const {state: searchState} = useSearchReducer();
    const previewSize: PreviewSize = displayTypeToPreviewSize(searchState.display.size);

    const valuesToDisplay = Array.isArray(value) ? value : [value];

    if (!valuesToDisplay.length) {
        return <></>;
    }

    switch (type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            return <StandardCell cellData={data} values={valuesToDisplay} />;
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
        case AttributeType.tree:
            const [firstValue, ...otherValues] = valuesToDisplay;

            const whoAmI = type === AttributeType.tree ? firstValue?.record?.whoAmI : firstValue?.whoAmI;

            return whoAmI ? (
                <RecordCardCellWrapper>
                    <RecordCard
                        record={whoAmI}
                        size={PreviewSize.small}
                        lang={lang}
                        key={whoAmI.id}
                        withPreview={true}
                        withLibrary={false}
                        simplistic
                    />

                    {otherValues.length ?? 0 ? <AllValuesCount values={valuesToDisplay} /> : <></>}
                </RecordCardCellWrapper>
            ) : null;
        default:
            // selection and infos column has no type
            if (columnName === infosCol) {
                return <CellInfos record={value} previewSize={previewSize} lang={lang} />;
            }

            return <></>;
    }
};

export default Cell;
