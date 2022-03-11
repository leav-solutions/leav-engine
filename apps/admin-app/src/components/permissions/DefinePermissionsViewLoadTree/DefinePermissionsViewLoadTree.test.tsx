// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {render} from 'enzyme';
import React from 'react';
import DefinePermissionsViewLoadTree from './DefinePermissionsViewLoadTree';

jest.mock('../../../hooks/useLang');

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
