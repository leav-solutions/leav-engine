// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import TreesList from './TreesList';

jest.mock('../../../hooks/useLang');

describe('TreesList', () => {
    test('Snapshot test', async () => {
        const onRowClick = jest.fn();
        const comp = render(<TreesList trees={null} onRowClick={onRowClick} />);

        expect(comp).toMatchSnapshot();
    });
});
