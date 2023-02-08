// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {Spin} from 'antd';
import {SelectionModeContext} from 'context';
import useSearchReducer from 'hooks/useSearchReducer';
import {useContext} from 'react';
import {resetSearchSelection, resetSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import styled from 'styled-components';
import {displayTypeToPreviewSize} from 'utils';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import getItemPreviewSize from './helpers/getItemPreviewSize';
import ItemTileDisplay from './ItemTileDisplay';

const LoadingWrapper = styled.div`
    height: 30rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Wrapper = styled.div<{size: string}>`
    grid-area: data;
    height: 100%;
    overflow-y: scroll;
    border-radius: 0.25rem 0.25rem 0 0;
    border-bottom: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(calc(${({size}) => size} + 1rem), 1fr));
    align-content: flex-start;
`;

const Footer = styled.div`
    grid-area: pagination;
    display: flex;
    justify-content: space-around;
    border: 1px solid ${themeVars.borderLightColor};
    padding: 0.5rem;
`;

function TileDisplay(): JSX.Element {
    const {state: searchState} = useSearchReducer();
    const itemPreviewSize = getItemPreviewSize(displayTypeToPreviewSize(searchState.display.size));
    const dispatch = useAppDispatch();
    const selectionMode = useContext(SelectionModeContext);

    const _handleClick = () => {
        // On click outside of an element, unselect all
        if (selectionMode) {
            dispatch(resetSearchSelection());
        } else {
            dispatch(resetSelection());
        }
    };

    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection
    }));

    return (
        <>
            <Wrapper size={itemPreviewSize} onClick={_handleClick}>
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
