// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {act, render, screen} from '_tests/testUtils';
import {IStandardFieldValue, virginValue} from '../../reducers/standardFieldReducer/standardFieldReducer';
import {FieldScope} from '../../_types';
import ValuesVersionBtn from './ValuesVersionBtn';

describe('ValuesVersionBtn', () => {
    const mockValue: IStandardFieldValue = {
        ...virginValue,
        idValue: '123456',
        displayValue: 'my value',
        editingValue: 'my value',
        value: {
            value: 'my value',
            raw_value: 'my raw value',
            created_at: null,
            created_by: null,
            modified_at: null,
            modified_by: null,
            id_value: null
        }
    };

    test('Display available versions on click', async () => {
        const versions = {
            [FieldScope.CURRENT]: {
                lang: {
                    id: '1337',
                    label: 'FR'
                }
            },
            [FieldScope.INHERITED]: {
                lang: {
                    id: '1337',
                    label: 'EN'
                }
            }
        };

        const onScopeChange = jest.fn();
        render(
            <ValuesVersionBtn versions={versions} activeScope={FieldScope.INHERITED} onScopeChange={onScopeChange} />
        );

        const valuesVersionBtn = screen.getByRole('button', {name: /values-version/});
        expect(valuesVersionBtn).toBeInTheDocument();

        await act(async () => {
            userEvent.click(valuesVersionBtn);
        });

        expect(screen.getByRole('menuitem', {name: /fr/i})).toBeInTheDocument();
        expect(screen.getByRole('menuitem', {name: /en/i})).toBeInTheDocument();

        await act(async () => {
            userEvent.click(screen.getByRole('menuitem', {name: /fr/i}));
        });

        expect(onScopeChange).toHaveBeenCalledWith(FieldScope.CURRENT);

        await act(async () => {
            userEvent.click(screen.getByRole('menuitem', {name: /en/i}));
        });

        expect(onScopeChange).toHaveBeenCalledWith(FieldScope.INHERITED);
    });
});
