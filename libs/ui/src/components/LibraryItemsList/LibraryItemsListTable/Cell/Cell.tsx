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
    const {lang} = useLang();

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

                    {otherValues.length ?? 0 ? <AllValuesCount values={valuesToDisplay} attributeType={type} /> : <></>}
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