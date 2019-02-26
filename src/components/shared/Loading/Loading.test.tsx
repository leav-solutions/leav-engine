import {shallow} from 'enzyme';
import React from 'react';
import {create} from 'react-test-renderer';
import Loading from '../../shared/Loading';

describe('Loading', () => {
    test('Snapshot test', async () => {
        const comp = create(<Loading />).toJSON();

        expect(comp).toMatchSnapshot();
    });

    test('Display dimmer', () => {
        const comp = shallow(<Loading withDimmer />);

        expect(comp.find('Dimmer').length).toBe(1);
    });
});
