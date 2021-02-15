// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import ErrorDisplay from '.';

describe('ErrorDisplay', () => {
    test('Display error', async () => {
        const comp = render(<ErrorDisplay message="my_error_message" />);

        expect(comp.text()).toContain('my_error_message');
    });
});
