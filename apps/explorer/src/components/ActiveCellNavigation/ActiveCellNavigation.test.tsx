// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, screen} from '_tests/testUtils';
import {mockTreeElement} from '../../__mocks__/common/treeElements';
import ActiveCellNavigation from './ActiveCellNavigation';

jest.mock(
    'components/shared/RecordCard',
    () =>
        function RecordCard() {
            return <div>RecordCard</div>;
        }
);

describe('ActiveCellNavigation', () => {
    test('should display the label of the record', async () => {
        await act(async () => {
            render(<ActiveCellNavigation treeElement={mockTreeElement} depth={0} />);
        });

        expect(screen.getByText('RecordCard')).toBeInTheDocument();
    });
});
