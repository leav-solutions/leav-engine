// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Spin} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import React from 'react';
import styled from 'styled-components';
import themingVar from '../../../themingVar';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import ItemTileDisplay from './ItemTileDisplay';

const LoadingWrapper = styled.div`
    height: 30rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Wrapper = styled.div`
    grid-area: data;
    height: 100%;
    overflow-y: scroll;
    border-radius: 0.25rem 0.25rem 0 0;
    border-bottom: none;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-content: flex-start;
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
    return (
        <>
            <Wrapper>
                {searchState.loading ? (
                    <LoadingWrapper>
                        <Spin size="large" />
                    </LoadingWrapper>
                ) : (
                    <>
                        {searchState.records.map(record => (
                            <ItemTileDisplay key={record.whoAmI.id} item={record} />
                        ))}
                    </>
                )}
            </Wrapper>

            <Footer>
                <LibraryItemsListPagination />
            </Footer>
        </>
    );
}

export default TileDisplay;
