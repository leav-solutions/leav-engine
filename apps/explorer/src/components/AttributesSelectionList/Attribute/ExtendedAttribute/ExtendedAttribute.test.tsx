// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockAttributeExtended} from '../../../../__mocks__/common/attribute';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import ExtendedAttribute from './ExtendedAttribute';

describe('AttributeExtended', () => {
    test('Should call ExploreEmbeddedFields', async () => {
        //TODO write better tests when UI refactoring is done
        let comp: any;

        await act(async () => {
            comp = render(
                <MockedProviderWithFragments>
                    <ExtendedAttribute
                        attribute={mockAttributeExtended}
                        path={mockAttributeExtended.id}
                        library="test_lib"
                        depth={0}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp).toMatchSnapshot();
    });
});
