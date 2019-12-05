import React from 'react';
import {render} from 'enzyme';
import ALCInputConnector from './ALCInputConnector';

describe('ALCInputConnector', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <ALCInputConnector size={100} types={[]} colorTypeDictionnary={{int: [255, 255, 255]}} connColor={[]} />
        );

        expect(comp).toMatchSnapshot();
    });
});
