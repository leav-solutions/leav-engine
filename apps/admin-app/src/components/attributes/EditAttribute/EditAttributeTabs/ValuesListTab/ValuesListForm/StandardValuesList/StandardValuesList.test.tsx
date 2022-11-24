// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute} from '_gqlTypes/GET_ATTRIBUTES_VALUES_LIST';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {mockAttrSimple} from '__mocks__/attributes';
import StandardValuesList from '.';

describe('StandardValuesList', () => {
    const onValuesUpdate = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockAttribute: GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute = {
        ...mockAttrSimple,
        values_list: {
            enable: true,
            allowFreeEntry: false,
            values: ['valueA', 'valueB']
        },
        unique: null
    };

    test('Render existing list', async () => {
        await act(async () => {
            render(
                <StandardValuesList
                    attribute={mockAttribute}
                    values={['value 1', 'value 2']}
                    onValuesUpdate={onValuesUpdate}
                />
            );
        });

        expect(screen.getAllByRole('listitem', {name: 'values-list-value'})).toHaveLength(2);
    });

    test('Add a value', async () => {
        await act(async () => {
            render(
                <StandardValuesList
                    attribute={mockAttribute}
                    values={['value 1', 'value 2']}
                    onValuesUpdate={onValuesUpdate}
                />
            );
        });

        await act(async () => {
            userEvent.click(screen.getByRole('button', {name: 'add-value'}));
        });

        expect(screen.getAllByRole('listitem', {name: 'values-list-value'})).toHaveLength(3);
    });

    test('Delete a value', async () => {
        await act(async () => {
            render(
                <StandardValuesList
                    attribute={mockAttribute}
                    values={['value 1', 'value 2']}
                    onValuesUpdate={onValuesUpdate}
                />
            );
        });

        await act(async () => {
            userEvent.click(screen.getAllByRole('button', {name: 'delete-value'})[0]);
        });

        expect(screen.getAllByRole('listitem', {name: 'values-list-value'})).toHaveLength(1);
    });

    test('When editing a value, calls value update on blur', async () => {
        await act(async () => {
            render(
                <StandardValuesList
                    attribute={mockAttribute}
                    values={['value 1', 'value 2']}
                    onValuesUpdate={onValuesUpdate}
                />
            );
        });

        const inputElem = screen.getAllByRole('textbox')[1];
        await act(async () => {
            await userEvent.type(inputElem, '!');
            fireEvent.blur(inputElem);
        });

        expect(onValuesUpdate).toBeCalledWith(['value 1', 'value 2!']);
    });

    test('When editing a value, calls value update on "enter""', async () => {
        await act(async () => {
            render(
                <StandardValuesList
                    attribute={mockAttribute}
                    values={['value 1', 'value 2']}
                    onValuesUpdate={onValuesUpdate}
                />
            );
        });

        const inputElem = screen.getAllByRole('textbox')[1];

        await act(async () => {
            await userEvent.type(inputElem, '!');
            await userEvent.type(inputElem, '{Enter}');
        });

        expect(onValuesUpdate).toBeCalledWith(['value 1', 'value 2!']);
    });

    describe('Date range attribute', () => {
        test('Display value', async () => {
            await act(async () => {
                render(
                    <StandardValuesList
                        attribute={{...mockAttribute, format: AttributeFormat.date_range}}
                        values={[{from: '1639061243', to: '1639652400'}]}
                        onValuesUpdate={onValuesUpdate}
                    />
                );
            });

            expect(screen.getByRole('textbox', {name: 'date-from'})).toBeInTheDocument();
            expect(screen.getByRole('textbox', {name: 'date-from'})).toHaveValue('2021-12-09');
            expect(screen.getByRole('textbox', {name: 'date-to'})).toBeInTheDocument();
            expect(screen.getByRole('textbox', {name: 'date-to'})).toHaveValue('2021-12-16');
        });

        test('Can add a value', async () => {
            await act(async () => {
                render(
                    <StandardValuesList
                        attribute={{...mockAttribute, format: AttributeFormat.date_range}}
                        values={[]}
                        onValuesUpdate={onValuesUpdate}
                    />
                );
            });

            await act(async () => {
                userEvent.click(screen.getByRole('button', {name: 'add-value'}));
            });

            await act(async () => {
                fireEvent.change(screen.getByRole('textbox', {name: 'date-from'}), {target: {value: '2021-12-09'}});
            });

            await act(async () => {
                fireEvent.change(screen.getByRole('textbox', {name: 'date-to'}), {target: {value: '2021-12-16'}});
            });

            expect(onValuesUpdate).toBeCalled();
        });
    });
});
