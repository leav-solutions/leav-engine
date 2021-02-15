// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType} from '../../../../_types/types';
import BodyCell from './BodyCell';

jest.mock(
    '../Cell',
    () =>
        function Cell() {
            return <div>Cell</div>;
        }
);

describe('BodyCell', () => {
    const mockCell = {
        getCellProps: jest.fn(),
        column: {
            id: 'columnId'
        },
        value: {value: 'valueCell', type: AttributeType.simple, id: 'idCell'}
    };
    test('should call cell', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<BodyCell cell={mockCell as any} index="0" />);
        });

        expect(comp.find('Cell')).toHaveLength(1);
    });
});
