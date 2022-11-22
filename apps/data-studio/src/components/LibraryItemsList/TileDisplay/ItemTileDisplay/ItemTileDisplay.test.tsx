// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, screen} from '_tests/testUtils';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {IItem} from '../../../../_types/types';
import ItemTileDisplay from './ItemTileDisplay';
jest.mock(
    '../../../shared/RecordPreview',
    () =>
        function RecordPreview() {
            return <div>RecordPreview</div>;
        }
);
describe('ItemTileDisplay', () => {
    const itemMock: IItem = {
        fields: {},
        whoAmI: {
            ...mockRecordWhoAmI,
            id: 'test'
        },
        index: 0
    };

    test('should call RecordPreview', async () => {
        await act(async () => {
            render(<ItemTileDisplay item={itemMock} />);
        });

        expect(screen.getByText('RecordPreview')).toBeInTheDocument();
    });
});
