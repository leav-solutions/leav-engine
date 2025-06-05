// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {render, screen, waitFor, within} from '_ui/_tests/testUtils';
import LinkSelect from './LinkSelect';
import userEvent from '@testing-library/user-event';

let user: ReturnType<typeof userEvent.setup>;

describe('LinkSelect', () => {
    beforeEach(() => {
        user = userEvent.setup();
    });

    it('should display the select without data and display create button when searching', async () => {
        render(
            <LinkSelect
                tagDisplay={false}
                options={[]}
                defaultValues={[]}
                onUpdateSelection={() => null}
                onCreate={() => null}
                onAdvanceSearch={() => null}
            />
        );

        const searchInput = screen.getByRole('combobox');
        await user.click(searchInput);

        expect(screen.getByText(/Aucune donnée/)).toBeVisible();

        const input = 'Chartreuse';
        await user.type(searchInput, input);

        expect(screen.getByRole('button', {name: `record_edition.new_record "${input}"`})).toBeVisible();
        expect(screen.getByRole('button', {name: /advanced_search/})).toBeVisible();
    });

    it('should display the selected default tags', async () => {
        const options = [
            {value: 'foo', label: 'Foo'},
            {value: 'bar', label: 'Bar'},
            {value: 'baz', label: 'Baz'}
        ];

        render(
            <LinkSelect
                tagDisplay={true}
                options={options}
                defaultValues={['foo', 'bar']}
                onUpdateSelection={() => null}
                onCreate={() => null}
                onAdvanceSearch={() => null}
            />
        );

        expect(screen.getByText('Foo')).toBeVisible();
        expect(screen.getByText('Bar')).toBeVisible();
        expect(screen.queryByText('Baz')).toBeNull();
    });

    it('should call onUpdateSelection when user selects items', async () => {
        const handleUpdate = jest.fn();

        const options = [
            {value: 'foo', label: 'Foo'},
            {value: 'bar', label: 'Bar'}
        ];

        render(
            <LinkSelect
                tagDisplay={false}
                options={options}
                defaultValues={[]}
                onUpdateSelection={handleUpdate}
                onCreate={() => null}
                onAdvanceSearch={() => null}
            />
        );

        const input = screen.getByRole('combobox');
        await user.click(input);
        await user.type(input, 'Foo');
        await user.keyboard('{Enter}');

        expect(handleUpdate).toHaveBeenCalledWith(['foo']);
    });

    it('should call onCreate with current search string', async () => {
        const handleCreate = jest.fn();

        render(
            <LinkSelect
                tagDisplay={false}
                options={[]}
                defaultValues={[]}
                onUpdateSelection={() => null}
                onCreate={handleCreate}
                onAdvanceSearch={() => null}
            />
        );

        const input = screen.getByRole('combobox');
        await user.click(input);
        await user.type(input, 'NewItem');

        const createBtn = screen.getByRole('button', {name: /"NewItem"/});
        await user.click(createBtn);

        expect(handleCreate).toHaveBeenCalledWith('NewItem');
    });

    it('should call onAdvanceSearch when clicking the button', async () => {
        const handleAdvanceSearch = jest.fn();

        render(
            <LinkSelect
                tagDisplay={false}
                options={[]}
                defaultValues={[]}
                onUpdateSelection={() => null}
                onCreate={() => null}
                onAdvanceSearch={handleAdvanceSearch}
            />
        );

        const input = screen.getByRole('combobox');
        await user.click(input);

        const advBtn = screen.getByRole('button', {name: /advanced_search/});
        await user.click(advBtn);

        expect(handleAdvanceSearch).toHaveBeenCalled();
    });

    it('should call onBlur with itemsToLink and itemsToDelete', async () => {
        const handleBlur = jest.fn();

        const options = [
            {value: 'alpha', label: 'Alpha'},
            {value: 'beta', label: 'Beta'}
        ];

        render(
            <LinkSelect
                tagDisplay={false}
                options={options}
                defaultValues={[]}
                onUpdateSelection={() => null}
                onCreate={() => null}
                onAdvanceSearch={() => null}
                onBlur={handleBlur}
            />
        );

        const input = screen.getByRole('combobox');
        await user.click(input);
        await user.type(input, 'Alpha');
        await user.keyboard('{Enter}');

        // Simulate blur
        input.blur();

        await waitFor(() => {
            expect(handleBlur).toHaveBeenCalledWith(new Set(['alpha']), new Set());
        });
    });

    it('should handle onSelect and onDeselect logic correctly', async () => {
        const handleBlur = jest.fn();

        const options = [{value: 'item1', label: 'Item 1'}];

        render(
            <LinkSelect
                tagDisplay={false}
                options={options}
                defaultValues={[]}
                onUpdateSelection={() => null}
                onCreate={() => null}
                onAdvanceSearch={() => null}
                onBlur={handleBlur}
            />
        );

        const input = screen.getByRole('combobox');
        await user.click(input);
        await user.type(input, 'Item 1');
        await user.keyboard('{Enter}');
        await user.keyboard('{Backspace}'); // triggers onDeselect

        input.blur();

        await waitFor(() => {
            expect(handleBlur).toHaveBeenCalledWith(new Set(), new Set(['item1']));
        });
    });
});
