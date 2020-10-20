import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockTreeElements} from '../../__mocks__/Navigation/treeElements';
import ColumnNavigation from './ColumnNavigation';

describe('ColumnNavigation', () => {
    test('should call CellNavigation', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<ColumnNavigation treeElements={mockTreeElements} />);
        });

        expect(comp.find('CellNavigation')).toHaveLength(1);
    });
});
