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
            ),
        });

        expect(result.current).toEqual({
            param1: 'value1',
            param2: 'value2',
        });
    });
});
