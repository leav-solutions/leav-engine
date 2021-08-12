// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import List from './List';

describe('List', () => {
    test('Render items', async () => {
        render(<List dataSource={['Item A', 'Item B']} />);

        expect(screen.getByText('Item A')).toBeInTheDocument();
    });

    test('Can override items rendering', async () => {
        render(<List dataSource={['Item A', 'Item B']} renderItem={item => <div>{item + 'Override'}</div>} />);

        expect(screen.getByText('Item AOverride')).toBeInTheDocument();
    });
});
