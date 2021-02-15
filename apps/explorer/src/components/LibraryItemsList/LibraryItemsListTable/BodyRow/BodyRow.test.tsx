// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {MockStateItems} from '../../../../__mocks__/stateItems/mockStateItems';
import BodyRow from './BodyRow';

jest.mock(
    '../BodyCell',
    () =>
        function BodyCell() {
            return <div>BodyCell</div>;
        }
);

jest.mock(
    '../BodyCell',
    () =>
        function BodyCell() {
            return <div>BodyCell</div>;
        }
);

describe('BodyRow', () => {
    const mockRow = {
        cells: [
            {
                getCellProps: () => ({
                    key: 1
                }),
                column: {
                    id: 'test'
                }
            }
        ],
        getRowProps: jest.fn()
    };
    test('should display n cells', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockStateItems>
                    <BodyRow row={mockRow as any} index={'test'} />
                </MockStateItems>
            );
        });

        expect(comp.find('BodyCell')).toHaveLength(1);
    });
});
