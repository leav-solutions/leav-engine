// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeConditionFilter, IFilterAttribute} from '_ui/types/search';
import {AttributeFormat} from '_ui/_gqlTypes';
import {act, render, screen} from '_ui/_tests/testUtils';
import {mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import {mockFilterAttribute} from '_ui/__mocks__/common/filter';
import {mockLibrarySimple} from '_ui/__mocks__/common/library';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import Filter from './Filter';

describe('Filter', () => {
    test('Should contain filter', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <Filter filter={mockFilterAttribute} handleProps={{} as any} />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByTestId('filter')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'filter-condition'})).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('If attribute is boolean, just display switch', async () => {
        const mockFilterBoolean: IFilterAttribute = {
            ...mockFilterAttribute,
            attribute: {
                ...mockAttributeSimple,
                isLink: false,
                isMultiple: false,
                library: mockLibrarySimple.id,
                format: AttributeFormat.boolean
            },
            condition: AttributeConditionFilter.EQUAL,
            value: {value: true}
        };

        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <Filter filter={mockFilterBoolean} handleProps={{} as any} />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByTestId('filter')).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: 'filter-condition'})).not.toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    test('If condition is "is empty", hide value input', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <Filter
                        filter={{
                            ...mockFilterAttribute,
                            condition: AttributeConditionFilter.IS_EMPTY,
                            value: null
                        }}
                        handleProps={{} as any}
                    />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByTestId('filter')).toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
});
