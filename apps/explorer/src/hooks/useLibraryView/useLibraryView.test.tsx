// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react-hooks';
import {defaultView, getSelectedViewKey} from 'constants/constants';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {getViewByIdQuery} from 'graphQL/queries/views/getViewById';
import {mockView} from '__mocks__/common/view';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {
    mockGetLibraryDetailExtendedDefaultView,
    mockGetLibraryDetailExtendedElement
} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import useLibraryView from './useLibraryView';

describe('useLibraryView', () => {
    const selectedViewKey = getSelectedViewKey(mockGetLibraryDetailExtendedElement.id);
    const mockNoUserData = {
        request: {
            query: getUserDataQuery,
            variables: {keys: [selectedViewKey]}
        },
        result: {
            data: {
                userData: {
                    [selectedViewKey]: null
                }
            }
        }
    };

    const mockUserDataWithView = {
        request: {
            query: getUserDataQuery,
            variables: {keys: [selectedViewKey]}
        },
        result: {
            data: {
                userData: {
                    [selectedViewKey]: mockView.id
                }
            }
        }
    };

    const mockUserDataThrowing = {
        request: {
            query: getUserDataQuery,
            variables: {keys: [selectedViewKey]}
        },
        error: new Error('boom!')
    };

    test('Nothing defined on user data nor library default view, return default view', async () => {
        const mocks = [mockNoUserData];

        const {result, waitFor} = renderHook(
            () => useLibraryView({...mockGetLibraryDetailExtendedElement, defaultView: null}),
            {
                wrapper: ({children}) => (
                    <MockedProviderWithFragments mocks={mocks}>{children as JSX.Element}</MockedProviderWithFragments>
                )
            }
        );
        expect(result.current.loading).toBe(true);

        await waitFor(() => !result.current.loading);

        expect(result.current.view).toEqual(defaultView);
        expect(result.current.error).toBe(null);
        expect(result.current.loading).toBe(false);
    });

    test('Nothing defined on user data, return library default view', async () => {
        const mocks = [mockNoUserData];

        const {result, waitFor} = renderHook(
            () =>
                useLibraryView({
                    ...mockGetLibraryDetailExtendedElement,
                    defaultView: {...mockGetLibraryDetailExtendedDefaultView, id: 'some_view'}
                }),
            {
                wrapper: ({children}) => (
                    <MockedProviderWithFragments mocks={mocks}>{children as JSX.Element}</MockedProviderWithFragments>
                )
            }
        );
        expect(result.current.loading).toBe(true);

        await waitFor(() => !result.current.loading);

        expect(result.current.view.id).toBe('some_view');
        expect(result.current.error).toBe(null);
        expect(result.current.loading).toBe(false);
    });

    test('Get user data and return last used view', async () => {
        const mocks = [
            mockUserDataWithView,
            {
                request: {
                    query: getViewByIdQuery,
                    variables: {viewId: mockView.id}
                },
                result: {
                    data: {
                        view: mockView
                    }
                }
            }
        ];

        const {result, waitFor} = renderHook(
            () => useLibraryView({...mockGetLibraryDetailExtendedElement, defaultView: null}),
            {
                wrapper: ({children}) => (
                    <MockedProviderWithFragments mocks={mocks}>{children as JSX.Element}</MockedProviderWithFragments>
                )
            }
        );
        expect(result.current.loading).toBe(true);

        await waitFor(() => !result.current.loading);

        expect(result.current.view).toEqual(defaultView);
        expect(result.current.error).toBe(null);
        expect(result.current.loading).toBe(false);
    });

    test('If something went wrong, return error', async () => {
        const mocks = [mockUserDataThrowing];

        const {result, waitFor} = renderHook(
            () => useLibraryView({...mockGetLibraryDetailExtendedElement, defaultView: null}),
            {
                wrapper: ({children}) => (
                    <MockedProviderWithFragments mocks={mocks}>{children as JSX.Element}</MockedProviderWithFragments>
                )
            }
        );
        expect(result.current.loading).toBe(true);

        await waitFor(() => !result.current.loading);

        expect(result.current.view).toEqual(defaultView);
        expect(result.current.error).toBeDefined();
        expect(result.current.loading).toBe(false);
    });
});
