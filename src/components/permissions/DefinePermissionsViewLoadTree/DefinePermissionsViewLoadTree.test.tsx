import {render} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import DefinePermissionsViewLoadTree from './DefinePermissionsViewLoadTree';

describe('DefinePermissionsViewLoadTree', () => {
    test('Snapshot test', async () => {
        const onClick = jest.fn();
        const selectedNode = null;
        const comp = render(
            <MockedProvider>
                <DefinePermissionsViewLoadTree treeId="test_tree" onClick={onClick} selectedNode={selectedNode} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
