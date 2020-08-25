import {Card, Col, Row, Spin} from 'antd';
import React, {useState} from 'react';
import styled from 'styled-components';
import {IItem, IRecordEdition} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import LibraryItemsModal from '../LibraryItemsListTable/LibraryItemsModal';
import ItemTileDisplay from './ItemTileDisplay';

interface IItemsTitleDisplayProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

const LoadingWrapper = styled.div`
    height: 30rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Wrapper = styled(Card)`
    &&& {
        height: calc(100vh - 11rem);
        overflow-y: scroll;
        margin-bottom: 0;
        border-radius: 0.25rem 0.25rem 0 0;
        border-bottom: none;
        padding: 0;
        margin-top: 6px;
    }
`;

const Footer = styled.div`
    display: flex;
    justify-content: space-around;
    border: 1px solid #f5f5f5;
    padding: 0.5rem;
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
        <div>
            <Wrapper>
                {stateItems.itemsLoading ? (
                    <LoadingWrapper>
                        <Spin size="large" />
                    </LoadingWrapper>
                ) : (
                    <Row gutter={[24, 24]}>
                        {stateItems.items?.map(item => (
                            <Col key={item.id} span={4}>
                                <ItemTileDisplay
                                    item={item}
                                    stateItems={stateItems}
                                    dispatchItems={dispatchItems}
                                    showRecordEdition={showRecordEdition}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </Wrapper>

            <Footer>
                <LibraryItemsListPagination stateItems={stateItems} dispatchItems={dispatchItems} />
            </Footer>

            <LibraryItemsModal
                showModal={recordEdition.show}
                values={recordEdition.item}
                closeModal={closeRecordEdition}
                updateValues={updateItem}
            />
        </div>
    );
}

export default TileDisplay;
