import React, {useState} from 'react';
import {Menu, Segment} from 'semantic-ui-react';
import styled from 'styled-components';
import {IItem, IRecordEdition} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import LibraryItemsModal from '../LibraryItemsListTable/LibraryItemsListTableRow/LibraryItemsModal';
import ItemTileDisplay from './ItemTileDisplay';

interface IItemsTitleDisplayProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

const WrapperItem = styled.div`
    display: grid;
    justify-items: center;
    align-items: start;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    grid-template-rows: repeat(auto-fit, auto);
    grid-gap: 1rem;
`;

const CustomSegment = styled(Segment)`
    &&& {
        height: calc(100% - 13rem);
        overflow-y: scroll;
        margin-bottom: 0;
        border-radius: 0.25rem 0.25rem 0 0;
        border-bottom: none;
    }
`;

const CustomPagination = styled(Segment)`
    &&& {
        margin-top: 0;
        border-radius: 0 0 0.25rem 0.25rem;
    }
`;

function TileDisplay({stateItems, dispatchItems}: IItemsTitleDisplayProps): JSX.Element {
    const [recordEdition, setRecordEdition] = useState<IRecordEdition>({
        show: false
    });

    const showRecordEdition = (item: IItem) => {
        setRecordEdition(re => ({show: true, item}));
    };

    const closeRecordEdition = () => {
        setRecordEdition(re => ({...re, show: false}));
    };

    const updateItem = (newItem: IItem) => {
        setRecordEdition(re => ({...re, item: newItem}));
    };

    return (
        <>
            <CustomSegment>
                <WrapperItem>
                    {stateItems.items?.map(item => (
                        <ItemTileDisplay
                            key={item.id}
                            item={item}
                            stateItems={stateItems}
                            dispatchItems={dispatchItems}
                            showRecordEdition={showRecordEdition}
                        />
                    ))}
                </WrapperItem>
            </CustomSegment>
            <CustomPagination secondary>
                <Menu pagination>
                    <LibraryItemsListPagination stateItems={stateItems} dispatchItems={dispatchItems} />
                </Menu>
            </CustomPagination>
            <LibraryItemsModal
                showModal={recordEdition.show}
                values={recordEdition.item}
                closeModal={closeRecordEdition}
                updateValues={updateItem}
            />
        </>
    );
}

export default TileDisplay;
