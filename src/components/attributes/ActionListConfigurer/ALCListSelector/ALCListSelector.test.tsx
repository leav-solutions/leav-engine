import React from 'react';
import {render} from 'enzyme';
import ALCListSelector from './ALCListSelector';

describe('ALCListSelector', () => {
    test('Snapshot test', async () => {
        const comp = render(<ALCListSelector />);

        expect(comp).toMatchSnapshot();
    });
});
