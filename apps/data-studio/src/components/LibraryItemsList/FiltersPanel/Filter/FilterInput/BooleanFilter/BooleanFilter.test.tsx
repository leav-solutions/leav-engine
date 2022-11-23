// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {mockFilterAttribute} from '__mocks__/common/filter';
import BooleanFilter from './BooleanFilter';

beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }))
    });
});

describe('BooleanFilter', () => {
    test('Should show switch, checked', async () => {
        render(<BooleanFilter filter={{...mockFilterAttribute}} updateFilterValue={jest.fn()} />);

        expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
    });

    test('Should show switch, unchecked', async () => {
        render(
            <BooleanFilter filter={{...mockFilterAttribute, value: {value: false}}} updateFilterValue={jest.fn()} />
        );

        expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
    });
});
