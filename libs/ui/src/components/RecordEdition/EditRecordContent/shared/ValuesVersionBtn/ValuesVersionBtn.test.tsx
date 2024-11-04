// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {VersionFieldScope} from '../../_types';
import ValuesVersionBtn from './ValuesVersionBtn';

describe('ValuesVersionBtn', () => {
    test('Display available versions on click', async () => {
        const versions = {
            [VersionFieldScope.CURRENT]: {
                lang: {
                    id: '1337',
                    label: 'FR'
                }
            },
            [VersionFieldScope.INHERITED]: {
                lang: {
                    id: '1337',
                    label: 'EN'
                }
            }
        };

        const onScopeChange = jest.fn();
        render(
            <ValuesVersionBtn
                versions={versions}
                activeScope={VersionFieldScope.INHERITED}
                onScopeChange={onScopeChange}
            />
        );

        const valuesVersionBtn = screen.getByRole('button', {name: /values-version/});
        expect(valuesVersionBtn).toBeInTheDocument();

        await userEvent.click(valuesVersionBtn);

        expect(screen.getByRole('menuitem', {name: /fr/i})).toBeInTheDocument();
        expect(screen.getByRole('menuitem', {name: /en/i})).toBeInTheDocument();

        userEvent.click(screen.getByRole('menuitem', {name: /fr/i}));

        await waitFor(() => expect(onScopeChange).toHaveBeenCalledWith(VersionFieldScope.CURRENT));

        await userEvent.click(valuesVersionBtn);

        userEvent.click(screen.getByRole('menuitem', {name: /en/i}));

        await waitFor(() => expect(onScopeChange).toHaveBeenCalledWith(VersionFieldScope.INHERITED));
    });
});
