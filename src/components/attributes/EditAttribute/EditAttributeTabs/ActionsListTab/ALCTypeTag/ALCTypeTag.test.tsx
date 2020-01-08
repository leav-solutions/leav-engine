import React from 'react';
import {render} from 'enzyme';
import ALCTypeTag from './ALCTypeTag';

describe('ALCTypeTag', () => {
    test('Snapshot test', async () => {
        const comp = render(<ALCTypeTag color={[255, 255, 255]} input={'ww'} />);

        expect(comp).toMatchSnapshot();
    });
});
