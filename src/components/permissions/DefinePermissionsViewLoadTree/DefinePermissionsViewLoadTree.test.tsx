import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
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
