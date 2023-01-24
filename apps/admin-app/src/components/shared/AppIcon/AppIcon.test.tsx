// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import AppIcon from './AppIcon';

describe('AppIcon', () => {
    test('Render app icon', async () => {
        render(<AppIcon size="big" />);

        expect(screen.getByRole('img')).toHaveAttribute('src', '/global-icon/big');
    });
});
