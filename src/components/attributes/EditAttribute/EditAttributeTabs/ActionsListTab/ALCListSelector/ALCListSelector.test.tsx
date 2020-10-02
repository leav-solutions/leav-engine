import {render} from 'enzyme';
import React from 'react';
import ALCListSelector from './ALCListSelector';

describe('ALCListSelector', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <ALCListSelector changeSelectorTo={jest.fn()} currentActionListName="test" connectionFailures={[]} />
        );

        expect(comp).toMatchSnapshot();
    });
});
