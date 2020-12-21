// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType, IAttribute} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import AttributeExtended from './AttributeExtended';

describe('AttributeExtended', () => {
    const mockAttribute: IAttribute = {
        id: 'test',
        library: 'test_library',
        type: AttributeType.simple,
        label: {
            fr: 'test',
            en: 'test'
        },
        isLink: false,
        isMultiple: false
    };

    test('Should call ExploreEmbeddedFields', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AttributeExtended
                        stateListAttribute={ListAttributeInitialState}
                        dispatchListAttribute={jest.fn()}
                        attribute={mockAttribute}
                        previousDepth={0}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('EmbeddedFieldItem')).toHaveLength(1);
    });
});
