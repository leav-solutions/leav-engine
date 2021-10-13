// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Card, Col, Row, Spin} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import React, {useState} from 'react';
import styled from 'styled-components';
import themingVar from '../../../themingVar';
import {IItem, IRecordEdition, PreviewSize} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import LibraryItemsModal from '../LibraryItemsListTable/LibraryItemsModal';
import ItemTileDisplay from './ItemTileDisplay';
import {displayTypeToPreviewSize} from 'utils';

const LoadingWrapper = styled.div`
    height: 30rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Wrapper = styled(Card)`
    &&& {
        grid-area: data;
        height: 100%;
        overflow-y: scroll;
        margin-bottom: 0;
        border-radius: 0.25rem 0.25rem 0 0;
        border-bottom: none;
        padding: 0;
        margin-top: 6px;
    }
`;

const Footer = styled.div`
    grid-area: pagination;
    display: flex;
    justify-content: space-around;
    border: 1px solid ${themingVar['@divider-color']};
    padding: 0.5rem;
`;

function TileDisplay(): JSX.Element {
    const {state: searchState} = useSearchReducer();
    const previewSize: PreviewSize = displayTypeToPreviewSize(searchState.display.size);
    const [recordEdition, setRecordEdition] = useState<IRecordEdition>({
        show: false
    });

    const closeRecordEdition = () => {
        setRecordEdition(re => ({...re, show: false}));
    };

    const updateItem = (newItem: IItem) => {
        setRecordEdition(re => ({...re, item: newItem}));
    };

    const CardSizes = {
        [PreviewSize.small]: 2,
        [PreviewSize.medium]: 4,
        [PreviewSize.big]: 8
    };

    return (
        <>
            <Wrapper>
                {searchState.loading ? (
                    <LoadingWrapper>
                        <Spin size="large" />
                    </LoadingWrapper>
                ) : (
                    <Row gutter={16}>
                        {searchState.records.map(record => (
                            <Col key={record.whoAmI.id} span={CardSizes[previewSize]}>
                                <ItemTileDisplay item={record} />
                            </Col>
                        ))}
                    </Row>
                )}
            </Wrapper>

            <Footer>
                <LibraryItemsListPagination />
            </Footer>

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
