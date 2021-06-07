// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import AttributeLinkedTree from '.';
import {ILabel} from '../../../../_types/types';
import {mockAttributeTree} from '../../../../__mocks__/common/attribute';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';

describe('AttributeLinkedTree', () => {
    test('should contain label and attribute id', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <AttributeLinkedTree
                        attribute={mockAttributeTree}
                        path={mockAttributeTree.id}
                        library="test_lib"
                        depth={0}
                    />
                </MockedProviderWithFragments>
            );
        });

        // mockAttributeTree.label.en and mockAttributeTree.id have the same name
        expect(screen.getAllByText((mockAttributeTree.label as ILabel).en)).toHaveLength(2);
    });
});
