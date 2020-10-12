import React from 'react';
import {mount} from 'enzyme';
import Navigation from './Navigation';
import {act} from 'react-dom/test-utils';

describe('Navigation', () => {
    test('', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<Navigation />);
        });

        expect(comp);
    });
});
