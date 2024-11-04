// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PropsWithChildren} from 'react';
import {SearchContext} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchContext';
import {initialSearchState} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {ISearchState} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/_types';
import {mockGetLibraryDetailExtendedElement} from '../mockQuery/mockGetLibraryDetailExtendedQuery';

const MockSearchContextProvider = ({state, children}: PropsWithChildren<{state?: Partial<ISearchState>}>) => (
        <SearchContext.Provider
            value={{
                state: {...initialSearchState, library: mockGetLibraryDetailExtendedElement, ...state},
                dispatch: jest.fn()
            }}
        >
            {children}
        </SearchContext.Provider>
    );

export default MockSearchContextProvider;
