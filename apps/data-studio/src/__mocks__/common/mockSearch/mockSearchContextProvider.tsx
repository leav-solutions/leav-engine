// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SearchContext} from 'hooks/useSearchReducer/searchContext';
import {initialSearchState} from 'hooks/useSearchReducer/searchReducer';
import {ISearchState} from 'hooks/useSearchReducer/_types';
import React, {PropsWithChildren} from 'react';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';

const MockSearchContextProvider = ({state, children}: PropsWithChildren<{state?: Partial<ISearchState>}>) => {
    return (
        <SearchContext.Provider
            value={{
                state: {...initialSearchState, library: mockGetLibraryDetailExtendedElement, ...state},
                dispatch: jest.fn()
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};

export default MockSearchContextProvider;
