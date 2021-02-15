// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import ActionsMenu from './ActionsMenu';

jest.mock('./ExportModal', () => {
    return function ExportModal() {
        return <div>ExportModal</div>;
    };
});

describe('ActionsMenu', () => {
    test('Snapshot test', async () => {
        const comp = render(<ActionsMenu />);

        expect(comp).toMatchSnapshot();
    });
});
