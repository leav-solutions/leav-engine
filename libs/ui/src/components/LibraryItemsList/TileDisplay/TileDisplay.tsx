// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Spin} from 'antd';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {displayTypeToPreviewSize} from '../helpers/displayTypeToPreviewSize';
import {SearchActionTypes} from '../hooks/useSearchReducer/searchReducer';
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

const Wrapper = styled.div<{$size: string}>`
    grid-area: data;
    height: 100%;
    overflow-y: scroll;
    border-radius: 0.25rem 0.25rem 0 0;
    border-bottom: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(calc(${({$size: size}) => size} + 1rem), 1fr));
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
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const itemPreviewSize = getItemPreviewSize(displayTypeToPreviewSize(searchState.display.size));

    const _handleClick = () => {
        searchDispatch({
            type: SearchActionTypes.SET_SELECTION,
            selected: []
        });
    };

    return (
        <>
            <Wrapper $size={itemPreviewSize} onClick={_handleClick}>
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
