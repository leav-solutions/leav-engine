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
    it('Should display the select without data and display create button when searching', async () => {
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
        await userEvent.type(searchInput, input);

        expect(screen.getByRole('button', {name: `record_edition.new_record "${input}"`})).toBeVisible();
        expect(screen.getByRole('button', {name: /advanced_search/})).toBeVisible();
    });
    it('Should display the tags as defaultValues', async () => {
        const options = [
            {value: 'foo', label: 'Foo'},
            {value: 'bar', label: 'Bar'},
            {value: 'baz', label: 'Baz'}
        ];
        render(
            <LinkSelect
                tagDisplay={true}
                options={options}
                defaultValues={[options[0].label, options[1].label]}
                onUpdateSelection={() => null}
                onCreate={() => null}
                onAdvanceSearch={() => null}
            />
        );

        const tag0 = screen.queryByText(options[0].label);
        const tag1 = screen.queryByText(options[1].label);
        const tag2 = screen.queryByText(options[2].label);
        expect(tag0).toBeVisible();
        expect(tag1).toBeVisible();
        expect(tag2).toBeNull();
    });
});
