// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType, IAttributesChecked} from '../../../_types/types';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import ItemSelected from './ItemSelected';

describe('ItemSelected', () => {
    const mockAttributeChecked: IAttributesChecked = {
        id: 'id',
        library: 'lib',
        label: {
            fr: 'label',
            en: 'label'
        },
        type: AttributeType.simple,
        depth: 0,
        checked: false
    };

    test('should display id', async () => {
        let comp: any;

        await act(async () => {
            comp = render(
                <ItemSelected
                    attributeChecked={mockAttributeChecked}
                    removeAttributeChecked={jest.fn()}
                    stateListAttribute={ListAttributeInitialState}
                    handleProps={{}}
                />
            );
        });

        expect(comp.text()).toContain('id');
    });
});
