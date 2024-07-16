// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {RecordCard} from '_ui/components';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {PreviewSize} from '_ui/constants';
import {useLang} from '_ui/hooks';
import {ITableCell} from '_ui/types/search';
import {AttributeType} from '_ui/_gqlTypes';
import {infosCol} from '../../constants';
import {displayTypeToPreviewSize} from '../../helpers/displayTypeToPreviewSize';
import AllValuesCount from './AllValuesCount';
import CellInfos from './CellInfos';
import StandardCell from './StandardCell';
import {getValuesToDisplayInCell} from './utils';
import {TypeGuards} from './typeGuards';
import {FunctionComponent} from 'react';
import {IRecordIdentityWhoAmI} from '_ui/types';

const RecordCardCellWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

interface ICellProps {
    columnName: string;
    data: ITableCell;
    onCellInfosEdit: () => void;
}

const Cell: FunctionComponent<ICellProps> = ({columnName, data, onCellInfosEdit}) => {
    const {value, type} = data;
    const {lang} = useLang();

    const {state: searchState} = useSearchReducer();
    const previewSize: PreviewSize = displayTypeToPreviewSize(searchState.display.size);

    const arrayOfValues = Array.isArray(value) ? value : [value];

    if (arrayOfValues.length === 0) {
        return <></>;
    }

    switch (type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            return <StandardCell cellData={data} values={arrayOfValues} />;
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
        case AttributeType.tree:
            const valuesToDisplay = getValuesToDisplayInCell(arrayOfValues);

            let whoAmI: IRecordIdentityWhoAmI = null;

            if (TypeGuards.isTreeCellValues(valuesToDisplay)) {
                whoAmI = valuesToDisplay[0]?.treeValue?.record?.whoAmI;
            }

            if (TypeGuards.isLinkCellValues(valuesToDisplay)) {
                whoAmI = valuesToDisplay[0].linkValue?.whoAmI;
            }

            const numberOfHiddenValues = valuesToDisplay.length - 1;

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
                    {numberOfHiddenValues > 0 && <AllValuesCount values={valuesToDisplay} attributeType={type} />}
                </RecordCardCellWrapper>
            ) : null;
        default:
            // selection and infos column has no type
            if (columnName === infosCol) {
                return <CellInfos record={value} previewSize={previewSize} lang={lang} onEdit={onCellInfosEdit} />;
            }

            return <></>;
    }
};

export default Cell;
