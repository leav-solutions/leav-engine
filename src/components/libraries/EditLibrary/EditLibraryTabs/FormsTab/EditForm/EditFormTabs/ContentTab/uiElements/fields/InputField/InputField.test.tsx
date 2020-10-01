import {render} from 'enzyme';
import React from 'react';
import InputField from './InputField';

describe('InputField', () => {
    test('Snapshot test', async () => {
        const comp = render(<InputField settings={{}} />);

        expect(comp).toMatchSnapshot();
    });
});
