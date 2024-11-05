// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeType, SortOrder} from '_ui/_gqlTypes';
import {act, render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import Header from './Header';

describe('Header', () => {
    test('should display value', async () => {
        const value = 'value';

        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <Header id="test" type={AttributeType.simple}>
                        {value}
                    </Header>
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByText(value)).toBeInTheDocument();
    });

    test('should use WrapperArrow with the sort props desc', async () => {
        const value = 'value';

        await act(async () => {
            render(
                <MockSearchContextProvider
                    state={{
                        sort: {
                            field: 'id',
                            order: SortOrder.desc
                        }
                    }}
                >
                    <Header id="test" type={AttributeType.simple}>
                        {value}
                    </Header>
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByText(value)).toBeInTheDocument();
        expect(screen.getByTestId('wrapper-arrow-desc')).toBeInTheDocument();
    });

    test('should use WrapperArrow with the sort props asc', async () => {
        const value = 'value';

        await act(async () => {
            render(
                <MockSearchContextProvider
                    state={{
                        sort: {
                            field: 'id',
                            order: SortOrder.asc
                        }
                    }}
                >
                    <Header id="test" type={AttributeType.simple}>
                        {value}
                    </Header>
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByText(value)).toBeInTheDocument();
        expect(screen.getByTestId('wrapper-arrow-asc')).toBeInTheDocument();
    });
});
