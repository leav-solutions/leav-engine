import React from 'react';
import {render} from 'enzyme';
import ALCOutputConnector from './ALCOutputConnector';

describe('ALCOutputConnector', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <ALCOutputConnector
                connectionState="connected"
                connColor={[]}
                size={100}
                types={['']}
                colorTypeDictionnary={{int: [255, 255, 255]}}
            />
        );

        expect(comp).toMatchSnapshot();
    });
});
