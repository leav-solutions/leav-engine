// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import AvailableSoon from './AvailableSoon';

describe('AvailableSoon', () => {
    test('Should render', async () => {
        render(<AvailableSoon />);

        expect(screen.getByText(/SOON/)).toBeInTheDocument();
    });
});
