import React from 'react';
import {render} from 'enzyme';
import ConnectorRect from './ConnectorRect';

describe('ConnectorRect', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <ConnectorRect
                size={1}
                types={['1', '2', '3']}
                colorTypeDictionnary={{float: [255, 0, 0], integer: [0, 255, 0], string: [0, 0, 255]}}
            />
        );

        expect(comp).toMatchSnapshot();
    });
});
