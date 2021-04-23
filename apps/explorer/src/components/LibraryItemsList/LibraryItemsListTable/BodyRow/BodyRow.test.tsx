// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
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
                <MockStore>
                    <BodyRow row={mockRow as any} index={'test'} />
                </MockStore>
            );
        });

        expect(comp.find('BodyCell')).toHaveLength(1);
    });
});
