// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, screen} from '_tests/testUtils';
import {mockTreeElement} from '../../../../../__mocks__/common/treeElements';
import Row from './Row';

jest.mock(
    'components/shared/RecordCard',
    () =>
        function RecordCard() {
            return <div>RecordCard</div>;
        }
);

describe('Cell', () => {
    test('should display the label of the record', async () => {
        await act(async () => {
            render(<Row treeElement={mockTreeElement} depth={0} isActive />);
        });

        expect(screen.getByText('RecordCard')).toBeInTheDocument();
    });
});
