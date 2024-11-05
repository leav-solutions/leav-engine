// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import useQueryParams from './useQueryParams';

describe('useQueryParams', () => {
    test('Extract query params from URL', async () => {
        const {result} = renderHook(() => useQueryParams(), {
            wrapper: ({children}) => (
                <MemoryRouter initialEntries={['/?param1=value1&param2=value2']}>
                    {children as JSX.Element}
                </MemoryRouter>
            )
        });

        expect(result.current).toEqual({
            param1: 'value1',
            param2: 'value2'
        });
    });
});
