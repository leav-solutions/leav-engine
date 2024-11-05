// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import MockedUserContextProvider from '_ui/testing/MockedUserContextProvider';
import {getUserDataQuery} from '_ui/_queries/userData/getUserData';
import {getViewByIdQuery} from '_ui/_queries/views/getViewById';
import {renderHook, waitFor} from '_ui/_tests/testUtils';
import {mockView} from '_ui/__mocks__/common/view';
import {
    mockGetLibraryDetailExtendedDefaultView,
    mockGetLibraryDetailExtendedElement
} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {defaultView, getSelectedViewKey} from '../../constants';
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

        const {result} = renderHook(() => useLibraryView({...mockGetLibraryDetailExtendedElement, defaultView: null}), {
            wrapper: ({children}) => (
                <MockedUserContextProvider>
                    <MockedProvider mocks={mocks}>{children as JSX.Element}</MockedProvider>
                </MockedUserContextProvider>
            )
        });
        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.view).toEqual(defaultView);
        expect(result.current.error).toBe(null);
    });

    test('Nothing defined on user data, return library default view', async () => {
        const mocks = [mockNoUserData];

        const {result} = renderHook(
            () =>
                useLibraryView({
                    ...mockGetLibraryDetailExtendedElement,
                    defaultView: {...mockGetLibraryDetailExtendedDefaultView, id: 'some_view'}
                }),
            {
                wrapper: ({children}) => (
                    <MockedUserContextProvider>
                        <MockedProvider mocks={mocks}>{children as JSX.Element}</MockedProvider>
                    </MockedUserContextProvider>
                )
            }
        );
        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.view.id).toBe('some_view');
        expect(result.current.error).toBe(null);
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

        const {result} = renderHook(() => useLibraryView({...mockGetLibraryDetailExtendedElement, defaultView: null}), {
            wrapper: ({children}) => (
                <MockedUserContextProvider>
                    <MockedProvider mocks={mocks}>{children as JSX.Element}</MockedProvider>
                </MockedUserContextProvider>
            )
        });
        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.view).toEqual(defaultView);
        expect(result.current.error).toBe(null);
    });

    test('If something went wrong, return error', async () => {
        const mocks = [mockUserDataThrowing];

        const {result} = renderHook(() => useLibraryView({...mockGetLibraryDetailExtendedElement, defaultView: null}), {
            wrapper: ({children}) => (
                <MockedUserContextProvider>
                    <MockedProvider mocks={mocks}>{children as JSX.Element}</MockedProvider>
                </MockedUserContextProvider>
            )
        });
        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.view).toEqual(defaultView);
        expect(result.current.error).toBeDefined();
    });
});
