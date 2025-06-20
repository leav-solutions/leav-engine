// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {render, screen, waitFor} from '_ui/_tests/testUtils';
import LinkSelect from './LinkSelect';
import userEvent from '@testing-library/user-event';
import {act} from '@testing-library/react';

let user: ReturnType<typeof userEvent.setup>;

describe('LinkSelect', () => {
    beforeEach(() => {
        user = userEvent.setup();
    });

    it('should display the select without data and display create button when searching', async () => {
        render(<LinkSelect tagDisplay={false} options={[]} defaultValues={[]} onSearch={async () => null} />);

        const searchInput = screen.getByRole('combobox');
        await user.click(searchInput);

        expect(screen.getByText(/Aucune donnée/)).toBeVisible();

        const input = 'Chartreuse';
        await user.type(searchInput, input);

        const btnChartreuse = await screen.findByRole('button', {name: /Chartreuse/});
        const btnAdvancedSearch = await screen.findByRole('button', {name: /advanced_search/});

        expect(btnChartreuse).toBeVisible();
        expect(btnAdvancedSearch).toBeVisible();
    });

    it('should display the selected default tags', async () => {
        const options = [
            {value: 'foo', label: 'Foo'},
            {value: 'bar', label: 'Bar'},
            {value: 'baz', label: 'Baz'}
        ];

        render(<LinkSelect tagDisplay={true} options={options} defaultValues={['foo', 'bar']} />);

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

        render(<LinkSelect tagDisplay={false} options={options} defaultValues={[]} onUpdateSelection={handleUpdate} />);

        const input = screen.getByRole('combobox');
        await user.click(input);
        await user.type(input, 'Foo');

        const fooOption = screen.getAllByText('Foo')[1];
        await user.click(fooOption);

        expect(handleUpdate).toHaveBeenCalledWith(['foo']);
    });

    it('should call onCreate with current search string', async () => {
        const handleCreate = jest.fn();

        const options = [
            {value: 'foo', label: 'Foo'},
            {value: 'bar', label: 'Bar'}
        ];

        render(
            <LinkSelect
                tagDisplay={false}
                options={options}
                defaultValues={[]}
                onClickCreateButton={handleCreate}
                onSearch={jest.fn().resolveValueOnce()}
            />
        );

        const input = screen.getByRole('combobox');
        await user.click(input);
        await user.type(input, 'NewItem');

        const createButton = await screen.findByRole('button', {name: /NewItem/});
        await user.click(createButton);

        expect(handleCreate).toHaveBeenCalledWith('NewItem');
    });

    it('should call onBlur with itemsToLink', async () => {
        const handleBlur = jest.fn();

        const options = [
            {value: 'alpha', label: 'Alpha'},
            {value: 'beta', label: 'Beta'}
        ];

        render(<LinkSelect tagDisplay={false} options={options} defaultValues={[]} onBlur={handleBlur} />);

        const input = screen.getByRole('combobox');

        await user.click(input);
        await user.type(input, 'alpha');

        const alphaOption = screen.getByText('Alpha');
        await user.click(alphaOption);
        await user.click(document.body);

        await waitFor(() => {
            expect(handleBlur).toHaveBeenCalledWith(new Set(['alpha']), new Set([]));
        });
    });

    it('should call onBlur with itemsToDelete', async () => {
        const handleBlur = jest.fn();

        const options = [
            {value: 'alpha', label: 'Alpha'},
            {value: 'beta', label: 'Beta'}
        ];

        render(<LinkSelect tagDisplay={false} options={options} defaultValues={['alpha']} onBlur={handleBlur} />);

        const input = screen.getByRole('combobox');

        await user.click(input);
        await user.type(input, 'alpha');

        const [ignoreNonDisplayedTag, alphaOption] = screen.getAllByText('Alpha');
        await user.click(alphaOption);
        await user.click(document.body);

        await waitFor(() => {
            expect(handleBlur).toHaveBeenCalledWith(new Set([]), new Set(['alpha']));
        });
    });
});
