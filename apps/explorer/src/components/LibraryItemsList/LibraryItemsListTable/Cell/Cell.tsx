// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import {infosCol} from '../../../../constants/constants';
import {useStateItem} from '../../../../Context/StateItemsContext';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {displayTypeToPreviewSize} from '../../../../utils';
import {AttributeType, ITableItem, PreviewSize} from '../../../../_types/types';
import CellInfos from './CellInfos';
import CellRecordCard from './CellRecordCard';

const SimpleCell = styled.div`
    padding: 5px;
`;

interface ICellProps {
    columnName: string;
    data: ITableItem;
    index: string;
}

const Cell = ({columnName, data, index}: ICellProps) => {
    const {value, type, id, library} = data;

    const {
        stateItems: {displaySize: displayType}
    } = useStateItem();

    const [{lang}] = useLang();

    const previewSize: PreviewSize = displayTypeToPreviewSize(displayType);

    if (!value) {
        return <></>;
    }

    switch (type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            return <SimpleCell>{value}</SimpleCell>;
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
            return <CellRecordCard record={{...value.whoAmI}} size={previewSize} lang={lang} />;
        case AttributeType.tree:
            return <CellRecordCard record={{...value.whoAmI}} size={previewSize} lang={lang} />;
        default:
            //selection and infos column has no type
            if (columnName === infosCol) {
                return (
                    <CellInfos record={value} size={previewSize} lang={lang} index={index} id={id} library={library} />
                );
            }

            return <></>;
    }
};

export default Cell;
