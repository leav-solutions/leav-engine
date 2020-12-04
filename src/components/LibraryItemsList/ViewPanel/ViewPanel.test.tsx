import React from 'react';
import {mount} from 'enzyme';
import ViewPanel from './ViewPanel';
import {act} from 'react-dom/test-utils';

describe('ViewPanel', () => {
    test('', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<ViewPanel />);
        })

        expect(comp);
    });
});