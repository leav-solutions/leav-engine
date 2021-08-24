// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {Input, List, Spin} from 'antd';
import React, {useEffect, useReducer, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getLibraryDetailQuery} from '../../graphQL/queries/libraries/getLibraryDetailQuery';
import {useLang} from '../../hooks/LangHook/LangHook';
import {localizedTranslation} from '../../utils';
import {ITree} from '../../_types/types';
import ErrorDisplay from '../shared/ErrorDisplay';
import Tree from './Tree';
import treeSelectionListReducer, {
    TreesSelectionListActionTypes,
    initialState
} from './reducer/treesSelectionListReducer';
import {TreesSelectionListStateContext} from './reducer/treesSelectionListStateContext';
import SelectedTreesList from './SelectedTreesList';
import {CustomForm} from './sharedComponents';

const ListWrapper = styled.div`
    padding: 0.3rem 1rem 0 1rem;
    overflow-y: scroll;
    height: calc(100vh - 15rem);
`;

const Wrapper = styled.div<{multiple: boolean}>`
    display: Grid;
    grid-template-columns: repeat(${props => (props.multiple ? 2 : 1)}, 1fr);
    grid-column-gap: 0.3rem;
`;

interface ITreesSelectionListProps {
    library: string;
    multiple?: boolean;
    selectedTrees?: ITree[];
    onSelectionChange: (selectedTrees: ITree[]) => void;
}

function TreesSelectionList({
    multiple = true,
    library,
    selectedTrees = [],
    onSelectionChange
}: ITreesSelectionListProps): JSX.Element {
    const {t} = useTranslation();

    const searchRef = useRef<any>(null);
    const [{lang}] = useLang();
    const [searchValue, setSearchValue] = useState<string>('');

    const [state, dispatch] = useReducer(treeSelectionListReducer, {
        ...initialState,
        multiple,
        selectedTrees,
        library
    });

    // Retrieve linked trees list
    const {loading, error} = useQuery(getLibraryDetailQuery, {
        variables: {
            libId: library
        },
        onCompleted: data => {
            dispatch({
                type: TreesSelectionListActionTypes.SET_TREES,
                trees: data.libraries?.list[0]?.linkedTrees || []
            });
        }
    });

    useEffect(() => {
        onSelectionChange(state.selectedTrees);
    }, [onSelectionChange, state.selectedTrees]);

    // Display list
    if (loading) {
        return <Spin />;
    }

    const _handleSearchChange = (search: string) => {
        setSearchValue(search);
    };

    const _getResultSearch = (): ITree[] => {
        return state.trees.filter(tree => {
            const treeLabel = localizedTranslation(tree.label, lang).toLowerCase();

            return treeLabel.indexOf(searchValue) !== -1 || tree.id.indexOf(searchValue) !== -1;
        });
    };

    return (
        <TreesSelectionListStateContext.Provider value={{state, dispatch}}>
            <Wrapper multiple={state.multiple}>
                <ListWrapper>
                    <CustomForm>
                        <Input.Search
                            placeholder={t('trees-list.search')}
                            ref={searchRef}
                            onChange={event => _handleSearchChange(event.target.value ?? '')}
                        />
                    </CustomForm>
                    {error ? (
                        <ErrorDisplay message={error.message} />
                    ) : (
                        <List>
                            {(searchValue ? _getResultSearch() : state.trees).map(tree => (
                                <Tree key={tree.id} tree={tree} />
                            ))}
                        </List>
                    )}
                </ListWrapper>
                {multiple && <SelectedTreesList />}
            </Wrapper>
        </TreesSelectionListStateContext.Provider>
    );
}

export default TreesSelectionList;
