import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockTreeElement} from '../../__mocks__/Navigation/treeElements';
import CellNavigation from './CellNavigation';

describe('CellNavigation', () => {
    test('should display the id', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<CellNavigation treeElement={mockTreeElement} depth={0} />);
        });

        expect(comp);
    });
});
